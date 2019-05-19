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

app.use(bodyParser.json());


app.get('/hola', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      //console.log(documents);
      //res.json(documents);
      res.render('home', {
        title: 'customers app',
        documents
      });
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
