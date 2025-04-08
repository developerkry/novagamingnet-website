require("dotenv").config();
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

const mongoURI = process.env.MONGO_URI;
const validCategories = [
  "General Discussion",
  "Development Discussion",
  "Support Discussion",
  "Game Discussion",
];

async function lambdaHandler(event) {
    console.log("Received event:", JSON.stringify(event, null, 2));
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { title, content, userId, category, game } = JSON.parse(event.body);

  if (!title || !content || !userId || !category) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Title, content, userId, and category are required" }),
    };
  }

  if (!validCategories.includes(category)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid category" }),
    };
  }

  if (category === "Game Discussion" && !game) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Game is required for Game Discussion" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const usersCollection = db.collection("users");
    const threadsCollection = db.collection("threads");

    const user = await usersCollection.findOne({ id: userId });
    if (!user) {
      await client.close();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const newThread = {
      id: uuidv4(),
      title,
      content,
      authorId: userId,
      authorUsername: user.username,
      category,
      game: category === "Game Discussion" ? game : null,
      createdAt: new Date(),
    };

    await threadsCollection.insertOne(newThread);
    await client.close();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Thread created successfully", thread: newThread }),
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

exports.handler = lambdaHandler;