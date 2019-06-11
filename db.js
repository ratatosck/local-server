const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = "mydb";
var url = "mongodb://localhost:27017/";
const mongoOptions = {useNewUrlParser : true};

// "C:\Program Files\MongoDB\Server\4.0\bin\mongo.exe" => start mongodb service(copy to cmd)

const state = {
  db : null
};

console.log("8. afuera de connect");
const connect = (cb) =>{
  console.log("1. connect");
  if(state.db){
    console.log("2. if (state)");
    cb();
  }else{
    console.log("3. else");
    MongoClient.connect(url, mongoOptions,(err, client) => {
      console.log("4. mongoclient");
      if(err){
        console.log("5. mongoclient if(err)");
        cb();
      }else{
        console.log("6. mongoclient else");
        state.db = client.db(dbname);
        cb();
      }

    });
  }

}

const getPrimaryKey = (_id) => {
  return ObjectID(_id);
}

const getDB = () => {
  return state.db;
}

module.exports = {getDB, connect, getPrimaryKey};
