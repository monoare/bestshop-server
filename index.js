const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qfcfzds.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // add data to product collection
    const shopCollection = client.db("shopDB").collection("product");

    // add data to cart collection
    const cartCollection = client.db("shopDB").collection("cart");

    app.get("/product", async (req, res) => {
      const cursor = shopCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shopCollection.findOne(query);
      res.send(result);
    });

    // create the collection of product
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await shopCollection.insertOne(newProduct);
      res.send(result);
    });

    // Update the product data
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;

      const product = {
        $set: {
          name: updatedCoffee.name,
          image1: updatedCoffee.image1,
          image2: updatedCoffee.image2,
          image3: updatedCoffee.image3,
          brand: updatedCoffee.brand,
          type: updatedCoffee.type,
          price: updatedCoffee.price,
          rating: updatedCoffee.rating,
          description: updatedCoffee.description,
        },
      };

      const result = await shopCollection.updateOne(filter, product, options);
      res.send(result);
    });

    // shop cart related apis

    // read data from database
    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find();
      const carts = await cursor.toArray();
      res.send(carts);
    });

    // Send data to database
    app.post("/cart", async (req, res) => {
      const cart = req.body;
      console.log(cart);
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    // Delete data from database
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});
