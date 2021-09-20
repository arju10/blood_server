const express = require("express");
const { MongoClient } = require('mongodb');
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/User");
const app = express();
// mongoose
//   .connect(process.env.mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Database Connection Succesfull...!");
//   })
//   .catch((err) => {
//     console.log("Error: Database connection can not be established...!", err);
//   });

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9hyks.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log("Error : ", err);
  const donorCollection = client.db("blood_bank").collection("donors");
  const requestsCollection = client.db("blood_bank").collection("requests");
  const userCollection = client.db("blood_bank").collection("users");



// Add Donor
  app.post("/addDonor", (req,res) => {
    const newDonor = req.body;
    donorCollection.insertOne(newDonor)
    .then((result) => {
      console.log("Data Send",result.insertedCount);
      res.send(result.insertedCount > 0);
    })
    .catch((err) => {
      console.log(err);
    })
  });

  // Get All Donors
  app.get("/donors", (req,res) => {
    const search = req.query.search;
    donorCollection.find({blood_group : {$regex :search}}).toArray((err, donors) => {
      res.send(donors);
    })
  });

  
  // Request for blood
  app.post("/addRequest", (req,res) => {
    const newRequest = req.body;
    requestsCollection.insertOne(newRequest)
    .then((result) => {
      res.send(result.insertedCount > 0);
    })
    .catch((err) => {
      console.log(err);
    })
  });

  // All Requsts
  app.get("/requests", (req,res) => {
    requestsCollection.find({}).toArray((err, request) => {
      res.send(request);
    })
  });


  //Routes
app.post("/login", (req, res)=> {
  const { email, password} = req.body
  userCollection.findOne({ email: email}, (err, user) => {
      if(user){
          if(password === user.password ) {
              res.send({message: "Login Successfull", user: user})
          } else {
              res.send({ message: "Password didn't match"})
          }
      } else {
          res.send({message: "User not registered"})
      }
  })
  }) 
  
  app.post("/register", (req, res)=> {
  const { name, email, password} = req.body
  userCollection.findOne({email: email}, (err, user) => {
      if(user){
          res.send({message: "User already registerd"})
      } else {
          const user = new User({
              name,
              email,
              password
          })
          user.save(err => {
              if(err) {
                  res.send(err)
              } else {
                  res.send( { message: "Successfully Registered, Please login now." })
              }
          })
      }
  })
  
  }) 
  
// Finish

});







app.get("/", (req,res) => {
  res.send("Hello form Server");
});



const port = process.env.PORT || 5050 ;
app.listen(port, (req, res) => {
    console.log(`Server is running ${port}`);
});