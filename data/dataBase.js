//here we are connecting the mongodb
const mongodb = require("mongodb");
//mongoclient
//this mongoclient is used to connect to the mongodb server in our loacal machine
const MongoClient = mongodb.MongoClient;

//create the connrection in the local database
//this is a promise

let database;
async function connect() {
  //this is acessing the total data base and we have to separate the
  //blog data base
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
  //here the db is a methode that we can use to connect to a specific databse server
  database = client.db("blog");
}

//this function is used to handle the daabase checks weather the database is a valid or not and return thr wanted database
function getDb() {
  if (!database) {
    //if the data base is not found the code below throw will not run
    throw { message: "Database connection is not established" };
  }
  return database;
}

//addding the module exports for the above two functions , here we can ass like refeerence and use the exportedd functions in the other files that this file is imported
module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
