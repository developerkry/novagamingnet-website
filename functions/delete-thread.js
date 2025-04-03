const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { threadId } = JSON.parse(event.body);

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

    const result = await db.collection("threads").deleteOne({ id: threadId });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Thread not found or not authorized to delete" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Thread deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting thread:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete thread" }),
    };
  } finally {
    await client.close();
  }
};
