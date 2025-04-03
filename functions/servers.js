require("dotenv").config();
const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;
let client = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(mongoURI);
        await client.connect();
    }
    return client.db("web");
}

exports.handler = async () => {
    try {
        const db = await connectToDatabase();
        const servers = await db.collection("servers").find().toArray();
        return {
            statusCode: 200,
            body: JSON.stringify(servers),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch servers" }),
        };
    }
};
