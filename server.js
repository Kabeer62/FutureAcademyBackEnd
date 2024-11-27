// Import dependencies:
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const path = require('path');

// Create an Express.js instance:
var app = express();

// Config Express.js
app.use(express.json());
app.set('port', 3001);

// Serve static files (images) from the 'images' folder
var imagePath = path.resolve(__dirname, "images");
app.use('/images', express.static(imagePath));

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

// MongoDB connection
let db;
MongoClient.connect('mongodb+srv://kabeerkumar577:9510Kabeer@cst2120.ppvcmnk.mongodb.net/', (err, client) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    db = client.db('webstore');
    console.log("Connected to MongoDB");
});

// Default route
app.get('/', (req, res, next) => {
    res.send('Welcome to the API! Use /products to fetch product details.');
});

// Fetch all products
app.get('/products', async (req, res) => {
    try {
        const products = await db.collection('products').find().toArray(); // 'products' is the collection name
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Fetch a specific product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await db.collection('products').findOne({ _id: new ObjectID(req.params.id) });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });