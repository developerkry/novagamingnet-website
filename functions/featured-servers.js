const { MongoClient } = require("mongodb");

const mongoURI = "mongodb+srv://nova:1234@nova.b6duy3u.mongodb.net/web";
let client = null;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(mongoURI);
        await client.connect();
    }
    return client.db("web");
}

exports.handler = async () => {
    try {
        const db = await connectToDatabase();
        const servers = await db.collection("servers").find().toArray();
        const weightedServers = [];
        servers.forEach(server => {
            for (let i = 0; i < server.bias; i++) {
                weightedServers.push(server);
            }
        });
        const featured = weightedServers.sort(() => Math.random() - 0.5).slice(0, 3);
        return {
            statusCode: 200,
            body: JSON.stringify(featured),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch featured servers" }),
        };
    }
};
