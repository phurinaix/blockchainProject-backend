const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');
const SHA256 = require("crypto-js/sha256");
const glob = require("glob");
const UUID = require('uuid-js');
const { Issuer } = require('./db/issuer.js');
const { Recipient } = require('./db/recipient.js');
const { db } = require('./db/db.js');
const port = process.env.PORT || 8000;
const issuerProfile = require('./issuerProfile/issuerProfile.json');
const revocationList = require('./issuerProfile/revocationList.json');
const cert_default = require('./cert_data/cert_default.json');
const issuer = new Issuer();
let certCount = 1;
var userLoginKey = [];

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({
    limit: '20mb'
}));
  
app.use(bodyParser.urlencoded({
    limit: '20mb',
    parameterLimit: 100000,
    extended: true 
}));

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    next();
});

app.get('/', (req, res) => {
    res.send('Thammasat University');
});

app.get('/intro', (req, res) => {
    res.send('Introduction');
})

app.post('/intro', (req, res) => {
    var data = req.body;
    if (data.nonce && data.bitcoinAddress) {
        db.query("SELECT * FROM recipient", (err, result) => {
            if (err)  {
                throw err;
            } else {
                // var index = result.findIndex(recipient => SHA256(recipient.identity).toString().substring(10, 20) == data.nonce);
                var index = result.findIndex(recipient => recipient.identity == data.nonce);
                if (index !== -1) {
                    var identity = result[index].identity;
                    var sql = `UPDATE recipient SET pubKey = 'ecdsa-koblitz-pubkey:${data.bitcoinAddress}' WHERE identity = '${identity}'`;
                    db.query(sql, (err, result) => {
                        if (err) throw err;
                        return res.status(200).send('success');
                    });
                } else {
                    return res.status(403).send('failed');
                }
            }
        });
    } else {
        res.status(403).send('failed');
    }
});

app.get('/issuer-profile', (req, res) => {
    res.send(JSON.stringify(issuerProfile));
});

app.get('/revocation-list-testnet', (req, res) => {
    res.send(JSON.stringify(revocationList));
});

/** Create template website */
app.get('/issuer/information', (req, res) => {
    res.send(issuer.getInfo());
});

app.post('/issuer/information', (req, res) => {
    var data = req.body;
    var json = cert_default;

    if (data.issuer_url && data.issuer_email && data.issuer_name && data.issuer_id && data.issuer_pubKey && data.revocation_list && data.issuer_logo) {
        issuer.updateAll(data.issuer_url, data.issuer_email, data.issuer_name, data.issuer_id, data.issuer_pubKey, data.revocation_list, data.issuer_logo);
        json.badge.issuer.id = data.issuer_id;
        json.badge.issuer.name = data.issuer_name;
        json.badge.issuer.url = data.issuer_url;
        json.badge.issuer.email = data.issuer_email;
        json.badge.issuer.revocationList = data.revocation_list;
        json.verification.publicKey = data.issuer_pubKey;
        json.badge.issuer.image = data.issuer_logo;

        fs.writeFile('./cert_data/cert_default.json', JSON.stringify(json), (err) => {
            if (err) throw err;
            res.send('success');
        });
    } else {
        res.send('not_complete');
    }
});

app.get('/diploma_template/:cert_name', (req, res) => {
    var file = `${__dirname}/cert_data/cert_template/${req.params.cert_name}.json`;
    res.download(file);
});


app.get('/diploma_template', (req, res) => {
    var getDirectories = function (src, callback) {
        glob(__dirname + '/' + src + '/**/*', callback);
    };
    getDirectories('cert_data/cert_template', function (err, result) {
        if (err) {
            throw err;
        } else {
            res.send(JSON.stringify(result));
        }
    });
});

app.post('/diploma_template', (req, res) => {
    var data = req.body;
    var json = cert_default;

    if (data.cert_title && data.cert_description && data.cert_img && data.criteria_narrative && data.signature_img ) {
        var badge_id = UUID.create();
        json.badge.id = badge_id.toString();
        json.badge.name = data.cert_title;
        json.badge.description = data.cert_description;
        json.badge.image = data.cert_img;
        json.badge.criteria.narrative = data.criteria_narrative;
        json.badge.signatureLines[0].image = data.signature_img;

        fs.writeFile(`${__dirname}/cert_data/cert_template/cert${certCount++}.json`, JSON.stringify(json), (err) => {
            if (err) throw err;
            res.send('success');
        });
    } else {
        res.send('not_complete');        
    }
});

app.delete('/diploma_template/:cert_name', (req, res) => {
    var certName = req.params.cert_name;
    if (certName) {
        try {
            fs.unlink(`${__dirname}/cert_data/cert_template/${certName}.json`, err => {
                if (err) throw err;
                res.send('success');
            });
        }
        catch (err) {
            res.send('fail');
        }
    } else {
        res.send('fail');
    }
});

app.get('/diploma/recipient', (req, res) => {
    var sql = `SELECT DISTINCT recipient.name, recipient.pubKey, recipient.identity, recipient.email
    FROM recipient
    INNER JOIN credential ON recipient.identity=credential.student_id WHERE credential.diploma=true`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.post('/diploma/recipient', (req, res) => {
    var postData = req.body;
    fs.readFile(`./cert_data/cert_template/${postData.cert_name}.json`, 'utf8', (err, data) => {
        if (err) throw err;
        var jsonData = JSON.parse(data);
        postData.choose_recipients.forEach(recipient => {
            jsonData.recipient.identity = recipient.identity;
            jsonData.recipientProfile.name = recipient.name;
            jsonData.recipientProfile.publicKey = recipient.pubKey;
            fs.writeFile(`./cert_data/unsigned_certificates/${postData.cert_name}-${recipient.identity}.json`, JSON.stringify(jsonData), err => {
                if (err) throw err;
            });
        });
        res.send('success');
    });
});

/** Student website **/

app.post('/recipient/email', (req, res) => {
    var data = req.body;
    if (data.email && data.identity) {
        if (!(/^\d+$/.test(data.identity))) {
            return res.send('fail');
        }
        if (data.identity.length !== 10) {
            return res.send('fail');
        }
        db.query(`UPDATE recipient SET email = '${data.email}' WHERE identity='${data.identity}'`, (err, result) => {
            if (err) throw err;
            res.send('success');
        });
    } else {
        res.send('fail');
    }
});

app.get('/recipient/:id', (req, res) => {
    var id = req.params.id;
    var sql = `SELECT email FROM recipient WHERE identity='${id}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result[0].email);
    });
});

app.get('/recipients', (req, res) => {
    db.query("SELECT * FROM recipient", function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.post('/recipient', (req, res) => {
    var data = req.body;
    if (data.name && data.id) {
        if (!(/^[A-Za-z]+$/.test(data.name.replace(/ /g,'')))) {
            return res.send('invalid_name');
        }
        if (!(/^\d+$/.test(data.id))) {
            return res.send('invalid_id');
        }
        if (data.id.length !== 10) {
            return res.send('id_length');
        }
        db.query(`SELECT * FROM recipient WHERE name = '${data.name.toLowerCase()}' AND identity = '${data.id}'`, (err, result) => {
            if (err) {
                throw err;
            } else {
                if (result.length === 0) {
                    return res.send('invalid_name_id');
                } else {
                    var responseData = {
                        status: 'success',
                        key0: UUID.create().toString()
                    }
                    userLoginKey.push(responseData.key0);
                    return res.send(JSON.stringify(responseData));
                }
            }
        });

    } else {
        res.send('not_complete');
    }
});

app.post('/recipient/session', (req, res) => {
    var data = req.body;
    if (userLoginKey.includes(data.key)) {
        return res.send('authorized');
    }
    res.send('unauthorized');
});

app.post('/recipient/logout', (req, res) => {
    var data = req.body;
    if (userLoginKey.includes(data.key)) {
        userLoginKey = userLoginKey.filter(key => key !== data.key);
        return res.send('success');
    }
    res.send('fail');
});

app.get('/recipient/credential/:identity', (req, res) => {
    var student_id = req.params.identity;
    if (!student_id) {
        return res.send('empty_id');
    }
    if (!(/^\d+$/.test(student_id))) {
        return res.send('invalid_id');
    }
    if (student_id.length !== 10) {
        return res.send('id_length');
    }
    var sql = `SELECT * FROM credential WHERE student_id = '${student_id}'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        return res.send(JSON.stringify(result));
    });
});

app.post('/recipient/credential', (req, res) => {
    var data = req.body;
    if (typeof data.diploma === "boolean" && typeof data.transcript === "boolean") {
        if (data.diploma === true || data.transcript === true) {
            if (!data.id) {
                return res.send('empty_id');
            }
            if (!(/^\d+$/.test(data.id))) {
                return res.send('invalid_id');
            }
            if (data.id.length !== 10) {
                return res.send('id_length');
            }
            var sql = `SELECT * FROM credential WHERE student_id = '${data.id}'`;
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    var numRows = result.length;
                    if (numRows >= 5) {
                        return res.send('limit');
                    } else {
                        var sql = `INSERT INTO credential (student_id, diploma, transcript) VALUES ('${data.id}', ${data.diploma}, ${data.transcript})`;
                        db.query(sql, (err, result) => {
                            if (err) throw err;
                            return res.send('success');
                        });
                    }
                }
            });
            
        } else {
            return res.send('empty_credential');
        }
    } else {
        res.send('invalid_type');
    }
});

app.delete('/recipient/credential/:id', (req, res) => {
    var id = req.params.id;
    if (!isNaN(id)) {
        var sql = `DELETE FROM credential WHERE id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.send('success');
        });
    } else {
        res.send('invalid_id');
    }
});

/** End of Student website **/

app.listen(port, () => {
    console.log(`server starting on port ${port}`);
});