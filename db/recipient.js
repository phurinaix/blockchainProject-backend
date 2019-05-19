const SHA256 = require("crypto-js/sha256");

class Recipient {
    constructor () {
        this.recipients = [
            {name: 'Frank Abagnale', pubKey: 'ecdsa-koblitz-pubkey:mtr98kany9G1XYNU74pRnfBQmaCg2FZLmc', identity:'2345678901'},
        ]
    }
    addRecipient(name, pubKey, identity) {
        const recipient = {name, pubKey: `ecdsa-koblitz-pubkey:${pubKey}`, identity};
        this.recipients.push(recipient);
    }
    addPubKey(nonce, pubKey) {
        var index = this.recipients.findIndex(recipient => SHA256(recipient.identity).substring(10, 20) == nonce);
        if (index !== -1) {
            this.recipients[index].pubKey = `ecdsa-koblitz-pubkey:${pubKey}`;
        }
    }
    getRecipients() {
        return this.recipients;
    }
}

module.exports = {Recipient};