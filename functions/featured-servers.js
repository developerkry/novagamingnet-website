const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;

exports.handler = async () => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const servers = await db.collection("servers").find().toArray(); // Fetch all servers
    await client.close();

    // Weighted random selection based on bias
    const weightedServers = [];
    servers.forEach(server => {
      for (let i = 0; i < server.bias; i++) {
        weightedServers.push(server);
      }
    });

    // Shuffle the weighted servers array
    for (let i = weightedServers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedServers[i], weightedServers[j]] = [weightedServers[j], weightedServers[i]];
    }

    // Select up to 5 unique servers
    const featuredServers = [];
    const seenServers = new Set();

    for (let i = 0; i < weightedServers.length && featuredServers.length < 5; i++) {
      const server = weightedServers[i];
      if (!seenServers.has(server.name)) {
        featuredServers.push(server);
        seenServers.add(server.name);
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(featuredServers),
    };
  } catch (error) {
    console.error("Error fetching featured servers:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch featured servers" }),
    };
  }
};
