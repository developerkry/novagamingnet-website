require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri || typeof uri !== "string" || !uri.startsWith("mongodb+srv://")) {
  console.error("Invalid or missing MONGODB_URI environment variable.");
  throw new Error("MONGODB_URI must be a valid MongoDB connection string.");
}

const client = new MongoClient(uri);

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    await client.connect();

    const database = client.db("web");
    const threadsCollection = database.collection("threads");

    const threads = await threadsCollection.find({}).toArray();
    console.log("Threads fetched successfully.");

    return {
      statusCode: 200,
      body: JSON.stringify(threads),
    };
  } catch (error) {
    console.error("Error fetching threads:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch threads", details: error.message }),
    };
  } finally {
    await client.close();
  }
};
