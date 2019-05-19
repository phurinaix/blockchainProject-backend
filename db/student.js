class Student {
    constructor () {
        this.data = [
            "first data"
        ]
    }
    addData(data) {
        this.data.push(data);
        
    }
    getData() {
        return this.data;
    }
}

module.exports = {Student};