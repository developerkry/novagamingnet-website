const { MongoClient } = require("mongodb");

const mongoURI = "mongodb+srv://nova:1234@nova.b6duy3u.mongodb.net/web";

async function testSponsors() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        const db = client.db("web");
        const sponsors = await db.collection("sponsors").find().toArray();
        console.log("Sponsors in the database:", sponsors);
        await client.close();
    } catch (error) {
        console.error("Error fetching sponsors:", error);
    }
}

testSponsors();
