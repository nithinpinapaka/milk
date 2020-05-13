
const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var express = require('express')
var app = express()
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));



//database connection
var url = "mongodb://localhost:27017/";
var database = null
MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
  if (err) throw err;
  database = db.db("milk");
});


//schema   
var customersSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  amount: String,
  dc: String
});

var custModel = mongoose.model('customers', customersSchema);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//To view css and images we added folders in public folder

app.use(express.static(__dirname + '/public'));

//we make add.ejs as default file for thi server  

app.get("/", (req, res) => {
  res.render("index", {})
});

app.get("/add", (req, res) => {
  res.render("add", { response: '' })

});

app.get("/update", (req, res) => {
  res.render("update", { data: [], response: '' })
});

//we are  obtaining all data in mongoDB and sending data to add.js file
app.get("/all", function (req, res, next) {
  database.collection("customers").find({ dc: '0' }).toArray(function (err, result) {
    if (err) throw err;
    res.render("all", { data: result })
    console.log("data have been displayed");

  });
})

app.get("/delete", (req, res) => {
  res.render("delete", { data: [], response: '' })
});




//we are obtaining data from add.ejs and inserting data in to mongodb

app.post('/addcustomers', function (req, res) {

  var custDetails = new custModel({
    name: req.body.addname,
    mobile: req.body.addmobile,
    amount: req.body.addamount,
    dc: 0,

  });
  database.collection("customers").insertOne(custDetails, function (err, res) {
    if (err) throw err;
    console.log("document inserted");
    // db.close();
  });

  res.render("add", { response: "Customer added successfully" })
});




//we are deleting data by searching name from mongodb for deleting customer data

app.post("/delete", function (req, res) {

  var query = req.body.searchname;
  database.collection("customers").find({ $and: [{ dc: '0' }, { name: { $regex: query, $options: "i" } }] }).toArray(function (err, result) {
    if (err) throw err;

    res.render("delete", { data: result, response: '' })

    console.log("Search data have been displayed");

  });
});
//we are deleteting  particular  data from mongodb

app.post("/delete1", function (req, res) {
  var query = { mobile: req.body.deletefile };
  var updatedc = { $set: { dc: "1" } };
  // database.collection("customers").deleteOne(query, function (err, obj) {
  database.collection("customers").updateOne(query, updatedc, function (err, result) {
    if (err) throw err;
    res.render("delete", { data: [], response: "Customer Data Deleted Successfully" })
    console.log("customer data deleted");

  });

});


//we are updating particular data of customer


app.post("/update", function (req, res) {
  var query = req.body.searchname;
  database.collection("customers").find({ $and: [{ dc: '0' }, { name: { $regex: query, $options: "i" } }] }).toArray(function (err, result) {
    if (err) throw err;
    res.render("update", { data: result, response: '' })
    console.log("Search data have been displayed in Updatefile");

  });
});

app.post("/update1", function (req, res) {
  var query = { mobile: req.body.mobile };
  var updateDetails = { $set: { name: req.body.updatename, amount: req.body.updateamount, } };
  database.collection("customers").updateMany(query, updateDetails, function (err, result) {
    if (err) throw err;
    res.render("update", { data: [], response: "Cutomer Data Updated Successfully" })

    console.log("customer data updated in database");

  });

});



//we started the node server in this port
app.listen("3000", () => {
  console.log("server started");
});










