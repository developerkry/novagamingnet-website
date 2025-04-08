require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error("JWT_SECRET is not defined in the environment variables.");
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { username } = JSON.parse(event.body);

  if (!username || typeof username !== "string" || username.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid or missing username" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const defaultAvatar = "https://i.imgur.com/WFSYLmd.jpg"; // Default avatar URL
    const avatar = user.avatar || defaultAvatar; // Use default avatar if none is set

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        username: user.username,
        email: user.email,
        avatar,
      }),
    };
  } catch (error) {
    console.error("Error validating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
