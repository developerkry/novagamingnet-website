require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid"); // Add UUID for unique IDs

const mongoURI = process.env.MONGO_URI;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { username, email, password } = JSON.parse(event.body);

  if (!username || !email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "All fields are required" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const usersCollection = db.collection("users");

    // Ensure both username and email are unique
    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      const conflictField = existingUser.username === username ? "Username" : "Email";
      return {
        statusCode: 409,
        body: JSON.stringify({ error: `${conflictField} already exists` }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4(); // Generate a unique ID for the user
    const defaultAvatar = "https://i.imgur.com/WFSYLmd.jpg"; // Default avatar URL

    await usersCollection.insertOne({
      id: userId,
      username,
      email,
      password: hashedPassword,
      avatar: defaultAvatar, // Set default avatar
    });

    await client.close();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered successfully" }),
    };
  } catch (error) {
    console.error("Error during registration:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
