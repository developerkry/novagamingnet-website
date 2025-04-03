const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  const topic = event.queryStringParameters.topic;

  if (!topic) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Topic is required" }),
    };
  }

  const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 5000 }); // Set a 5-second timeout

  try {
    await client.connect();
    const db = client.db("web");
    const threads = await db.collection("threads").find({ topic }).toArray();
    await client.close();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(threads),
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch threads" }),
    };
  } finally {
    await client.close(); // Ensure the client is closed even if an error occurs
  }
};
