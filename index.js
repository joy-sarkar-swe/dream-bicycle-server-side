const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svxyg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db('dream-cycle-store');
        const cycleCollection = database.collection('cycle-collection');
        const bookingCollection = database.collection('booking-collection');
        const reviewCollection = database.collection('review-collection');
        const usersCollection = database.collection('users-collection');

        //POST API FOR NEW PRODUCT ADDING API
        app.post('/addProducts', async (req, res) => {
            const newProduct = req.body;
            const result = await cycleCollection.insertOne(newProduct);
            res.json(result);
        });

        //POST API FOR NEW USER ADDING API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //GET API FOR CHECK ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //PUT API FOR NEW USER ADDING API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //POST API TO GET USER REVIEW
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        //PUT API TO MAKE ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        //POST API TO GET USER REVIEW
        app.get('/reviews', async (req, res) => {
            const review = reviewCollection.find({});
            const allReviews = await review.toArray();
            res.send(allReviews);
        });

        // GET API FOR ALL DATA LOAD IN PRODUCTS SECTION API
        app.get('/products', async (req, res) => {
            const cursor = cycleCollection.find({});
            const allProducts = await cursor.toArray();
            res.send(allProducts);
        })

        // GET SINGLE PRODUCT API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await cycleCollection.findOne(query);
            res.send(product);
        })

        // MANAGE ALL PRODUCTS API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cycleCollection.deleteOne(query);
            res.json(result);
        })

        //POST API FOR BOOK PACKAGE API
        app.post('/bookedOrders', async (req, res) => {
            const bookedPackage = req.body;
            const result = await bookingCollection.insertOne(bookedPackage);
            res.json(result);
        })

        //GET MY ORDERED PACKAGES API
        app.get('/myOrders/:email', async (req, res) => {
            const email = { email: req.params.email }
            const result = await bookingCollection.find(email).toArray();
            res.send(result);
        })

        // MANAGE ALL ORDERS API
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })

        // MANAGE ALL ORDERS API
        app.delete('/manageOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })

        // GET ALL BOOKED ORDERS API
        app.get('/manageOrders', async (req, res) => {
            const cursor = bookingCollection.find({});
            const allBookedOrders = await cursor.toArray();
            res.send(allBookedOrders);
        })

        //UPDATE STATUS API
        app.put("/manageOrders/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello, I am form node js and express.')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:`, port)
})
