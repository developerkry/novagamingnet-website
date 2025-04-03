const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  const threadId = event.queryStringParameters.threadId;

  if (!threadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thread ID is required" }),
    };
  }

  const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db("web");
    const comments = await db.collection("comments").find({ threadId }).toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comments),
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch comments" }),
    };
  }
};
