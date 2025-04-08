const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const sponsors = await db.collection("sponsors").find().toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sponsors),
    };
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch sponsors" }),
    };
  }
};
