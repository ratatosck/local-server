const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const path = require('path');
const db = require('./db.js');

const collection = "customers";

app.get('/hola', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      //console.log(documents);
      res.json(documents);
    }
  });
});

db.connect((err) => {
  if(err){
    console.log('unable to connect to database');
    process.exit(1);
  }else{
    app.listen(3000, "0.0.0.0", () => {
      console.log('connected to database, app listening on port 3000');
    });
  }
});
