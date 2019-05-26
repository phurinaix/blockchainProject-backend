const decryptNumber = (encryptMsg) => {
    var strArr = ['A', 'B', 'C', 'x', 'y', 'z', 'k', 'M', 'N', 'R'];
    var number = '';
    for(let i = 0; i < encryptMsg.length; i++) {
        number += strArr.indexOf(encryptMsg[i]);
    }
    return number;
}

module.exports = { decryptNumber };