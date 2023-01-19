const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const port = process.env.PROT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijfbjuv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

console.log(process.env.SECRET_TOKEN);

//jwt verify middleware
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  const mobilesCollection = client.db("resaleProducts").collection("mobiles");
  const userCollection = client.db("resaleProducts").collection("user");
  const addProductCollection = client
    .db("resaleProducts")
    .collection("AddProduct");
  const advertiseCollection = client
    .db("resaleProducts")
    .collection("advertise");
  const bookingsCollection = client.db("resaleProducts").collection("bookings");
  const paymentsCollection = client.db("resaleProducts").collection("payments");

  try {
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.SECRET_TOKEN, {
          expiresIn: "10h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "unauthorized access" });
    });

    app.get("/addproduct", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { sellerEmail: email };
      const result = await addProductCollection.find(query).toArray();
      res.send(result);
    });


    //get categories products

    app.get("/categories/oneplus", async (req, res) => {
     const query = {categories: "One plus", paid: { $nin: [ true ] }}
      const result = await addProductCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/categories/iphone",  async (req, res) => {
      const query = { categories: "Iphone", paid: { $nin: [ true ] }};
      const result = await addProductCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/categories/xiaomi", async (req, res) => {
      const query = { categories: "Xiaomi", paid: { $nin: [ true ] } };
      const result = await addProductCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/advertise", async (req, res) => {
      const query = { publish: "advertise", paid: { $nin: [ true ] } } ;
      const advertise = addProductCollection
        .find(query)
        .sort({ $natural: -1 })
        .limit(3);
      const result = await advertise.toArray();

      res.send(result);
    });

    // get order

    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const quary = { paid: true , email:email};
      const result = await bookingsCollection.find(quary).toArray();
      res.send(result);
    });
    
    app.get("/bookings",verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingsCollection.findOne(query);
      res.send(booking);
    });

    // get all users

    app.get("/allsellers", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { accountType: "seller" };
      console.log(query);
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

    //get all buyers
    app.get("/allbuyers", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { accountType: "buyer" };
      console.log(query);
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

    //get reported products

    app.get('/reported/product', async(req, res)=>{
      const query = {reported: true}
      const result = await addProductCollection.find(query).toArray();
      res.send(result)
    })

    app.put("/addproduct/report/:id", async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          reported: true,
        },
      };
      const result = await addProductCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    })

    // update product to advertise
    app.put("/addproduct/advertise/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          publish: "advertise",
        },
      };
      const result = await addProductCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //stripe

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await bookingsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    // put adproduct update 

      app.put("/addproduct/paid/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id : ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                paid: true
            }
        }
        const result = await addProductCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    })

    // is seller

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isSeller: user?.accountType === "seller" });
    });

    //is admin

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.accountType === "admin" });
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/mobiles", async (req, res) => {
      const query = {};
      const mobiles = await mobilesCollection.find(query).toArray();
      res.send(mobiles);
    });

    //post booking
    app.post("/booking", async (req, res) => {
      const user = req.body;
      const result = await bookingsCollection.insertOne(user);
      res.send(result);
    });

    //post user
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // post add product
    app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await addProductCollection.insertOne(product);
      res.send(result);
    });

    // put / update seller to  admin

    app.put("/allseller/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          accountType: "admin",
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // addproduct update successfully 

    // post add advertise

    app.post("/advertise", async (req, res) => {
      const advertise = req.body;
      const result = await advertiseCollection.insertOne(advertise);
      res.send(result);
    });

    // delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await addProductCollection.deleteOne(filter);
      res.send(result);
    });

    //deleting seller
    app.delete("/allsellers/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/reportedproduct/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await addProductCollection.deleteOne(filter);
      res.send(result);
    });


  } finally {
  }
};
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("resale zone server is running");
});

app.listen(port, () => console.log(`resale zone server running on ${port}`));
