const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");

    const creators = await db.collection("exclusiveCreators").find().toArray();
    const staff = await db.collection("staffTeam").find().toArray();

    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creators, staff }),
    };
  } catch (error) {
    console.error("Error fetching exclusive content:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch exclusive content" }),
    };
  }
};
