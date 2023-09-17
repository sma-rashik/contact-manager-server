const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const mongoURI = `mongodb+srv://contactManagerDB:contactManagerDB@cluster0.aujohll.mongodb.net/?retryWrites=true&w=majority`;

// Middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        // await client.connect();
        const contactDB = client.db("allContact").collection("contactsdata");

        app.get('/contacts', async (req, res) => {
            try {
                const cursor = contactDB.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error("Error while fetching data from MongoDB:", error);
                res.status(500).send("Error while fetching data from MongoDB");
            }
        });

        app.get("/contacts/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await contactDB.findOne(query);
                res.send(result);
                console.log(result);
            } catch (error) {
                console.error("Error while fetching data from MongoDB:", error);
                res.status(500).send("Error while fetching data from MongoDB");
            }
        });

        app.post("/contacts", async (req, res) => {
            try {
                const contactdata = req.body;
                const result = await contactDB.insertOne(contactdata);
                res.send(result);
            } catch (error) {
                console.error("Error while inserting data into MongoDB:", error);
                res.status(500).send("Error while inserting data into MongoDB");
            }
        });

        app.put('/contacts/:id', async (req, res) => {
            try {
                const contactId = req.params.id;
                const query = { _id: new ObjectId(contactId) };
                const updatedContact = req.body;

                const result = await contactDB.updateOne(
                    query,
                    { $set: updatedContact }
                );

                if (result.modifiedCount === 1) {
                    // Fetch the updated contact from the database
                    const updatedData = await contactDB.findOne(query);
                    res.json(updatedData);
                } else {
                    res.status(404).json({ error: 'Contact not found' });
                }
            } catch (error) {
                console.error("Error while updating data in MongoDB:", error);
                res.status(500).json({ error: error.message });
            }
        });


        app.delete('/contacts/:id', async (req, res) => {
            try {
                const contactId = req.params.id;
                const query = { _id: new ObjectId(contactId) };
                const result = await contactDB.deleteOne(query);

                if (result.deletedCount === 1) {
                    res.json({ message: 'Contact deleted' });
                } else {
                    res.status(404).json({ error: 'Contact not found' });
                }
            } catch (error) {
                console.error("Error while deleting data from MongoDB:", error);
                res.status(500).json({ error: error.message });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
