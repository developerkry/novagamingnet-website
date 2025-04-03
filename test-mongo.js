const { MongoClient } = require("mongodb");

const mongoURI = "mongodb+srv://nova:1234@nova.b6duy3u.mongodb.net/web";

async function testConnection() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        console.log("Connected to MongoDB successfully!");
        await client.close();
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

testConnection();
