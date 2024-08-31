const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://superslashergamez1:adammiah2@cluster0.hxktk9m.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas!');

        // Example: Access a specific database
        const db = client.db('myDatabase'); // Replace 'myDatabase' with your actual database name

        // Example: List collections in the database
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections);

        // You can perform other database operations here...

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        // Optionally, close the connection
        await client.close();
    }
}

// Call the function to connect to the database
connectToDatabase();
