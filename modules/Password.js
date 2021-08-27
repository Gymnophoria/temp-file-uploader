const fs = require('fs');

class Password {
    constructor(path) {
        this.password = fs.readFileSync(path).toString();
        this.path = path;
    }

    get text() {
        return this.password;
    }

    set text(password) {
        fs.writeFileSync(path, password);
        this.password = password;
    }
}

module.exports = Password;