const mysql = require('mysql');

var db = mysql.createConnection({
    host: "db4free.net",
    user: "phurinat",
    password: "q212w224e236",
    database: "blockcert_issuer"
  });
  
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = { db };