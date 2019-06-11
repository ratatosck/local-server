const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const db = require('./db.js');

//mongodb collection name
const collection = "customers";

const app = express();

//handlebars middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.engine('handlebars', exphbs({
  helpers:{
    // Function to do basic mathematical operation in handlebar
    math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
}}));

app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//---------------------------------------------------------------------------------------------------------------------------------------------------


//render product view on http get request
app.get('/products', (req, res) => {
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      //console.log(documents);
      //res.json(documents);
      res.render('products', {
        title: 'lista de Productos',
        documents
      });

    }
  });
});

//listen to http post requests done on /update to update one element
app.post('/update', (req, res) => {
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      const query = { _id: documents[req.body.number_to_change - 1]._id};
      const newvalues = { $set: {name: req.body.newname, address: req.body.newaddress} };
      db.getDB().collection(collection).updateOne(query, newvalues,(err, res) => {
        if(err){
          console.log(err);
        }else{
          console.log("1 updated");
        }
      });
    }
  });
  res.redirect('/products');
});

//listen to http post requests done on /delete to delete from the database
app.post('/delete', (req, res) => {
  //delete
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      console.log(documents[1]._id);
      const query = {
        _id: documents[req.body.number - 1]._id
      };
      db.getDB().collection("customers").deleteOne(query, (err, res) => {
        if (err){
        console.log(err);
      }else{
        console.log("1 document deleted");
      }
      });
    }
  });
  res.redirect('/products');
});

//listen to http post requests done on /create to introduce to the database
app.post('/create', (req, res) => {
  const customer = {
    name: req.body.name,
    address: req.body.address
  };
  //insert
  db.getDB().collection(collection).insertOne(customer, (err, res) =>{
    if(err){
      console.log(err);
    }else{
      console.log("one inserted");
    }
  });
   console.log(customer);
   res.redirect('/products');
});

//send main menu on http get request
app.get('/', (req, res) => {
      res.render('home', {
        title: 'Menú',
      });
});

//API of product data to send to browser in json format
app.get('/productAPI', (req, res) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
      if(err){
        console.log(err);
      }else{
        res.json(documents);
      }
    });
});

//send tabulator module on browser request through a virtual path
app.get('/node_modules/tabulator-tables/dist/js/tabulator.min.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/tabulator-tables/dist/js/tabulator.min.js'));
});
//send tabulator module on browser request through a virtual path
app.get('/node_modules/tabulator-tables/dist/css/tabulator.min.css', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/tabulator-tables/dist/css/tabulator.min.css'));
});

//send html page on http get request
app.get('/tabulator', (req, res) => {
  res.render('tabulator', {

  });
});


console.log("9. afuera de db.connect");
db.connect((err) => {
  console.log("7. bd connect");
  if(err){
    console.log('unable to connect to database');
    process.exit(1);
  }else{
    app.listen(3000, "0.0.0.0", () => {
      console.log('connected to database, app listening on port 3000');
    });
  }
});
