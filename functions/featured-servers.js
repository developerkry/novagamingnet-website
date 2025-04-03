const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const featuredServers = await db.collection("servers").find().limit(5).project({ name: 1, game: 1, img: 1, joinLink: 1 }).toArray(); // Limit to 5 servers
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(featuredServers),
    };
  } catch (error) {
    console.error("Error fetching featured servers:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch featured servers" }),
    };
  }
};
