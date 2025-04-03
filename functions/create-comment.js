const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { threadId, content, author } = JSON.parse(event.body);

  if (!threadId || !content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Thread ID and content are required" }),
    };
  }

  const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const db = client.db("web");

    const comment = {
      threadId,
      content,
      author: author || "Anonymous", // Use provided author or default to "Anonymous"
      date: new Date(),
    };

    await db.collection("comments").insertOne(comment);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Comment created successfully" }),
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create comment" }),
    };
  } finally {
    await client.close();
  }
};
