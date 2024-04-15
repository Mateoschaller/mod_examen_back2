const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');

app.use(cors()); // Permite todas las solicitudes CORS

app.use(express.json()); // Middleware para parsear JSON
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();
        const database = client.db('examen');
        const likesCollection = database.collection('likes');

        app.get('/likes', async (req, res) => {
            const likesDoc = await likesCollection.findOne();
            res.status(200).send({ likes: likesDoc ? likesDoc.count : 0 });
        });

        app.post('/likes', async (req, res) => {
            const updateResult = await likesCollection.updateOne({}, { $inc: { count: 1 } }, { upsert: true });
            if (updateResult.upsertedCount || updateResult.modifiedCount) {
                const updatedDoc = await likesCollection.findOne();
                res.status(200).send({ likes: updatedDoc.count });
            } else {
                res.status(500).send("Error updating likes count");
            }
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (e) {
        console.error(e);
        process.exit(1); // Salir del proceso con error
    }
}

main().catch(console.error);