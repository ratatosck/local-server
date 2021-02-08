const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

//mongodb collection names
const collection = "customers";
const reportes = "reportes";
const sales = "sales";

const app = express();

//handlebars middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.engine('handlebars', exphbs({
  helpers:{
    // Function to do basic mathematical operation in handlebar
    math: function(lvalue, operator, rvalue) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    },

    date: function(myDate){
      const d = new Date(myDate) + '';
      const r = d.split(" ");
      console.log(r);
      const newstr = r[0] +  " " + r[1] +  " " + r[2] + " " + r[3] + " " + r[4];
      console.log(newstr);
      return newstr;
    }
}


}));

app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//---------------------------------------------------------------------------------------------------------------------------------------------------


//render product view on http get request
app.get('/products', (req, res) => {
  res.render('venta', {
  });
});


//listen to http post requests done on /update to update one element
app.post('/update', (req, res) => {
      const query = req.body._id;
      const newvalues = { $set: {name: req.body.name, description: req.body.description, price: req.body.price, quantity: req.body.quantity} };
      console.log(newvalues);
      db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(query)}, newvalues,(err, res) => {
        if(err){
          console.log(err);
        }else{
          console.log(res);
        }
      });
    res.json('success');
});
//listen to http post requests done on /delete to delete from the database
app.post('/delete', (req, res) => {
  //delete
      const query = req.body._id;
      db.getDB().collection("customers").findOneAndDelete({_id: db.getPrimaryKey(query)}, (err, res) => {
        if (err){
        console.log(err);
      }else{
        console.log("1 document deleted");
      }
      });
  res.redirect('/tabulator');
});

//listen to http post requests done on /create to introduce to the database
app.post('/create', (req, response) => {
  const customer = {
    name: '',
    description: '',
    price:'',
    quantity:''
  };
  //insert
  db.getDB().collection(collection).insertOne(customer, (err, res) =>{
    if(err){
      console.log(err);
    }else{
      console.log(res.insertedId);
      response.json(res.insertedId);
    }
  });
});

app.post('/report', (req, res) => {
  const milliseconds = (new Date).getTime();
  const reporte = {
    titulo: req.body.titulo,
    contenido: req.body.contenido,
    date: milliseconds,
  };
  console.log(milliseconds);
  db.getDB().collection(reportes).insertOne(reporte, (err, res) =>{
    if(err){
      console.log(err);
    }else{
      console.log(res.insertedId);
    }
  });
res.redirect("/reportes");
});

//listen to post from sale and add date and code to the database
app.post('/sale', (req, res) => {
  const carrito = JSON.parse(req.body.items);
  console.log(carrito);
  carrito.forEach((item) => db.getDB().collection(sales).insertOne(item));
  res.json("success");
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
//API of sales data to send to browser in json format
app.post('/estadisticasAPI', (req, res) => {
    const query = req.body.id;
    console.log(query);
    db.getDB().collection(sales).find({ProductCode: query}).toArray((err, documents) => {
      if(err){
        console.log(err);
      }else{
        console.log(documents);
        res.json(documents);
      }
    });
});

app.get('/estadisticasAPI2', (req, res) => {
    db.getDB().collection(sales).find({}).toArray((err, documents) => {
      if(err){
        console.log(err);
      }else{
        console.log(documents);
        res.json(documents);
      }
    });
});


//send tabulator module on browser request through a virtual path
app.get('/node_modules/tabulator-tables/dist/js/tabulator.min.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/tabulator-tables/dist/js/tabulator.min.js'));
});
//send jquery module on browser request through a virtual path
app.get('/node_modules/jquery/dist/jquery.min.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
});
//holds the path for the tabulator css script
const css = '/node_modules/tabulator-tables/dist/css/tabulator_modern.min.css';
//send tabulator module on browser request through a virtual path
app.get(css, (req, res) => {
  res.sendFile(path.join(__dirname + css));
});
//send chart.js module on browser request through a virtual path
app.get('/node_modules/Chart.js/dist/Chart.bundle.min.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/node_modules/Chart.js/dist/Chart.bundle.min.js'));
});

//send html page on http get request
app.post('/tabulator', (req, res) => {
  console.log(req.body.token);
  jwt.verify(req.body.token, 'secretkey', (err, authData) => {
  if(err) {
    res.sendStatus(403);
  } else {
    res.redirect('/inventario');
  }
});
});

app.get('/inventario', (req, res) =>{
  res.render('inventario', {
  });
});

app.get('/estadisticas', (req, res) =>{
  res.render('estadisticas', {
  });
});

app.get('/reportes', (req, res) => {
  db.getDB().collection(reportes).find({}).sort({date: -1}).toArray((err, documents) => {
    if(err){
      console.log(err);
    }else{
      res.render('reportes', {
        documents
      });
    }
});
});
//-------------------------------------------------------login starts here-----------------------------------------------------
app.get('/loginForm', (req, res) =>{
  res.render('loginForm', {
  });
});

app.post('/login', (req, res) => {
  // Mock user
  const user = {
    id: 1,
    username: 'admin',
    password: 'admin'
  }
  console.log(req.body.usuario);
  console.log(req.body.contraseña);
  if(req.body.usuario == user.username && req.body.contraseña == user.password){
  jwt.sign({user}, 'secretkey', { expiresIn: '30s' }, (err, token) => {
    res.json({
      token
    });
  });
}else{
  res.sendStatus(400);
}
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}

//--------------------------------------------------------------------------------------------------------------------------------
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
