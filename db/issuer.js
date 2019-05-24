class Issuer {
    constructor () {
        this.info = {
            issuer_url: 'https://tu-issuer.herokuapp.com/',
            issuer_email: 'peterparkersatom@gmail.com',
            issuer_name: 'Thammasat University',
            issuer_id: 'https://tu-issuer.herokuapp.com/issuer-profile',
            issuer_pubKey: 'ecdsa-koblitz-pubkey:mryRuw13DoGciaBQXcUq8DeSUhbYRD4HTf',
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