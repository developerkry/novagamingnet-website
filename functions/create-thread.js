const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { topic, title, content } = JSON.parse(event.body);

  if (!topic || !title || !content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "All fields are required" }),
    };
  }

  const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 5000 }); // Set a 5-second timeout

  try {
    await client.connect();
    const db = client.db("web");

    const thread = {
      topic,
      title,
      content,
      author: "Anonymous", // Replace with actual user data if available
      date: new Date(),
    };

    await db.collection("threads").insertOne(thread);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Thread created successfully" }),
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create thread" }),
    };
  } finally {
    await client.close(); // Ensure the client is closed even if an error occurs
  }
};
