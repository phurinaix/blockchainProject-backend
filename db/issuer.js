class Issuer {
    constructor () {
        this.info = {
            issuer_url: 'https://tu-issuer.herokuapp.com/',
            issuer_email: 'peterparkersatom@gmail.com',
            issuer_name: 'Thammasat University',
            issuer_id: 'TU',
            issuer_pubKey: 'ecdsa-koblitz-pubkey:16EzhjxfcdWbESkW5v2ZASiQ27HVABsnTY',
            revocation_list: 'https://tu-issuer.herokuapp.com/revocation-list-testnet',
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