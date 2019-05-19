const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');
const { Issuer } = require('./db/issuer.js');
const { Recipient } = require('./db/recipient.js');
const port = process.env.PORT || 5000;
const cert_default = require('./cert_data/cert_default.json');
const issuer = new Issuer();
const recipient = new Recipient();
let certCount = 1;

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


app.get('/', (req, res) => {
    res.render('index.hbs');
});

app.get('/create', (req, res) => {
    res.render('create.hbs');
});

app.get('/diploma', (req, res) => {
    res.render('diploma.hbs');
});

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

// app.get("/issuer/logo", (req, res) => {
//     res.sendFile(path.join(__dirname, `./uploads/${req.params.img}.png`));
// });

app.get('/diploma_template/:cert_name', (req, res) => {
    var file = __dirname + `/cert_template/${req.params.cert_name}.json`;
    res.download(file);
});

app.get('/diploma_template', (req, res) => {
    fs.readdir('./cert_data/cert_template', function (err, files) {
        res.send(JSON.stringify(files));
    });
});

app.post('/diploma_template', (req, res) => {
    var data = req.body;
    var json = cert_default;

    if (data.badge_id && data.cert_title && data.cert_description && data.cert_img && data.criteria_narrative && data.signature_img ) {

        json.badge.id = data.badge_id;
        json.badge.name = data.cert_title;
        json.badge.description = data.cert_description;
        json.badge.image = data.cert_img;
        json.badge.criteria.narrative = data.criteria_narrative;
        json.badge.signatureLines[0].image = data.signature_img;

        fs.writeFile(`./cert_data/cert_template/cert${certCount++}.json`, JSON.stringify(json), (err) => {
            if (err) throw err;
            res.send('success');
        });
    } else {
        res.send('not_complete');        
    }
});

app.get('/recipients', (req, res) => {
    res.send(recipient.getRecipients());
});

app.post('/recipient', (req, res) => {
    var data = req.body;
    recipient.addRecipient(data.name, data.pubKey, data.identity);
    res.send('success');
});

app.post('/diploma/recipient', (req, res) => {
    var postData = req.body;
    // console.log('okay!!');
    fs.readFile(`./cert_data/cert_template/${postData.cert_name}.json`, 'utf8', (err, data) => {
        if (err) throw err;
        var jsonData = JSON.parse(data);
        // console.log(JSON.stringify(postData));
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

app.listen(port, () => {
    console.log(`server starting on port ${port}`);
});