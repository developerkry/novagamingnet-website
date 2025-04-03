require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email and password are required" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const user = await db.collection("users").findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid email or password" }),
      };
    }

    // Generate a JWT token for internal use
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ username: user.username }), // Only return username
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
