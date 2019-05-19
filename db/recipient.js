class Recipient {
    constructor () {
        this.recipients = [
            {name: 'Phurinat Puekkham', pubKey: 'ecdsa-koblitz-pubkey:mtr98kany9G1XYNU74pRnfBQmaCg2FZLmc', identity:'5810742139'},
            {name: 'Peter Parkers', pubKey: 'ecdsa-koblitz-pubkey:mwe98kany9G1XYNU74pRnfBQmaCg5FZLmc', identity:'5810352139'}
        ]
    }
    addRecipient(name, pubKey, identity) {
        const recipient = {name, pubKey: `ecdsa-koblitz-pubkey:${pubKey}`, identity};
        this.recipients.push(recipient);
    }
    getRecipients() {
        return this.recipients;
    }
}

module.exports = {Recipient};