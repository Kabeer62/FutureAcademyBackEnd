const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const path = require('path');
var fs = require("fs");

const app = express();
app.use(express.json());
app.set('port', 3000);

// Set CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function(req, res, next){
    const method = req.method;
    const url = req.url;
    const timestamp = new Date();

    console.log(`[${timestamp}] ${method} request to ${url}`); // Log request details

    // Capture and log response status when the response is finished
    res.on('finish', () => {
        console.log(`[${timestamp}] Response status: ${res.statusCode}`);
    });

    next();
})

// Serve static files
var imagePath = path.resolve(__dirname, "images");
app.use('/images', express.static(imagePath));

let db;

// Connect to MongoDB
MongoClient.connect('mongodb+srv://kabeerkumar577:9510Kabeer@cst2120.ppvcmnk.mongodb.net/webstore', (err, client) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    db = client.db();
    console.log("Connected to MongoDB");
});

// Check DB readiness
app.use((req, res, next) => {
    if (!db) {
        return res.status(500).send('Database not connected');
    }
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/products');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    console.log('collection name:', req.collection);
    next();
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

// Updated POST route to prevent duplicate entries based on 'id'
app.post('/collection/:collectionName', (req, res, next) => {
    const newItem = req.body;

    // Check if an item with the same 'id' already exists
    req.collection.findOne({ id: newItem.id }, (err, existingItem) => {
        if (err) return next(err);

        if (existingItem) {
            return res.status(400).send({ msg: 'Item with this ID already exists' });
        }

        // If no duplicate, insert the new item
        req.collection.insertOne(newItem, (e, result) => {
            if (e) return next(e);
            res.send(result.ops);
        });
    });
});

// PUT method to update a product (by its 'id')
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});

// DELETE method to remove a product (by its 'id')
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne({ _id: ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
    });
});

// Serve static content from back-end server
app.use("/images", express.static(imagePath));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express.js server running at localhost:${port}`);
});