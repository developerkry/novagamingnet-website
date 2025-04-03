const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  const category = event.queryStringParameters.category;

  if (!category) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Category is required" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const topics = await db.collection("topics").find({ category }).toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topics),
    };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch topics" }),
    };
  }
};
