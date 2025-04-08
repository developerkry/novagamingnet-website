require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const servers = await db.collection("servers").find().project({ name: 1, game: 1, img: 1, joinLink: 1 }).toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(servers),
    };
  } catch (error) {
    console.error("Error fetching servers:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch servers" }),
    };
  }
};
