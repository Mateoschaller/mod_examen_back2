const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');

app.use(cors()); // Permite todas las solicitudes CORS

app.use(express.json()); // Middleware para parsear JSON

const uri = "mongodb+srv://mateoschaller:Nce1fmSAilnwsPJq@cluster1.sj60qa8.mongodb.net/?retryWrites=true&w=majority&appName=cluster1";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function main() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");
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

        const PORT = 5000;
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (e) {
        console.error(e);
        process.exit(1); // Salir del proceso con error
    }
}

main().catch(console.error);