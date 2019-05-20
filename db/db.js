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

data = {
    // id: '1234567890',
    id: '1234567809',
    name: 'CristianoRonaldo'
};

db.query(`SELECT * FROM recipient WHERE identity = '${data.id}'`, (err, result) => {
    if (err) {
        throw err;
    } else {
        console.log(result);
        if (result.length > 0) {
            if (result[0].name !== data.name) {
                console.log('invalid_name_id');
            } else {
                console.log('can log in');
            }
        } else {
            console.log('new user');
        }
    }
});

module.exports = { db };