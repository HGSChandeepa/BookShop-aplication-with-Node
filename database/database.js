//import the promises
const mysql = require("mysql2/promise");

//create the pool
const pool = mysql.createPool({
  host: "localhost",
  database: "books_store",
  user: "root",
  password: "root",
});

module.exports = pool;
