class Student {
    constructor () {
        this.data = [
            "first data"
        ]
    }
    addData(data) {
        this.data.append(data);
    }
    getData() {
        return this.data;
    }
}

module.exports = {Student};