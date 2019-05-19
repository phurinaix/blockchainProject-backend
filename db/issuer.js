class Issuer {
    constructor () {
        this.info = {
            issuer_url: 'https://www.issuer.org',
            issuer_email: 'issuer@gmail.com',
            issuer_name: 'Thammasat University',
            issuer_id: 'sdfsdf',
            issuer_pubKey: 'ecdsa-koblitz-pubkey:msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
            revocation_list: 'https://www.blockcerts.org/samples/2.0/revocation-list-testnet.json',
            issuer_logo: null
        }
    }
    updateAll(url, email, name, id, pubKey, revocationList, logo) {
        this.info.issuer_url = url;
        this.info.issuer_email = email;
        this.info.issuer_name = name;
        this.info.issuer_id = id;
        this.info.issuer_pubKey = pubKey;
        this.info.revocation_list = revocationList;
        this.info.issuer_logo = logo;
    }
    getInfo() {
        return this.info;
    }
}

module.exports = {Issuer};