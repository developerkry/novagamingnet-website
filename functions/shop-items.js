const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const shopItems = await db.collection("shopItems").find().toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shopItems),
    };
  } catch (error) {
    console.error("Error fetching shop items:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch shop items" }),
    };
  }
};
