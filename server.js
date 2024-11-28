//Import dependencies modules:
const express = require('express');
const Collection = require('mongodb/lib/collection');
const { checkCollectionName } = require('mongodb/lib/utils');
const path=require('path')
// const bodyParser = require('body-parser')

//Create an Express.js instance:
var app = express()

// config Express.js
app.use(express.json())
app.set('port', 3000)

var imagePath = path.resolve(__dirname, "images");

app.use('/images', express.static(imagePath));

app.use(function(request, response, next) {
    response.writeHead(200, { "Content-Type": "text/plain" })
    response.end("Could not process(did not find static file)")
});


app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
})

//connect to mongodb
const MongoClient = require('mongodb').MongoClient;

let db;
//Mongo Client.connect('mongodb+srv://MyMongoDBUser:wednesday@cluster0.epqbr.mongodb.net', )
MongoClient.connect('mongodb+srv://kabeerkumar577:9510Kabeer@cst2120.ppvcmnk.mongodb.net/', (err, client) =>{

db = client.db('webstore')
})

app.get('/', (req, res, next) =>{
    res.send('Select a collection, e.g., /collection/messages')
})

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    //console.log('collection name:', req.collection) 
    return next()

})

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) =>{
        if(e) return next(e)
        res.send(results.ops)
    })
})

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next)=>{
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) =>{
        if (e) return next (e)
        res.send(result)
    })
})

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update({ _id: new ObjectID(req.params.id) }, { $set: req.body }, { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        })
})

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne({
        _id: ObjectID(req.params.id)},
        (e, result) =>{
            if (e) return next(e)
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        })
})

// app.listen(3000, () =>{
//     console.log('Express.js server running at localhost:3000');
// })

const port = process.env.PORT || 3000
app.listen(port)