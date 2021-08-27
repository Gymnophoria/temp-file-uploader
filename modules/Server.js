const fs = require('fs');
const path = require('path');

const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const Password = require('../modules/Password');
const config = require('../private/config.json');

class Server {
    constructor() {
        this.express = express();
        this.password = new Password(path.join(__dirname, '..', 'private', 'password.txt'));
        this.config = config;

        this.loadMiddleware();
        this.loadPostHandlers();
        this.loadGetHandlers();
        this.loadDatabase().then(this.start.bind(this));
    }

    loadMiddleware() {
        this.express.use(express.json());
    }

    loadPostHandlers() {
        const handlersPath = path.join(__dirname, '..', 'handlers', 'post');
        const handlers = fs.readdirSync(handlersPath);

        handlers.forEach(handler => {
            const func = require(path.join(handlersPath, handler));
            const handlerNoExt = handler.substring(0, handler.indexOf('.js'));

            this.express.post(`/${handlerNoExt}`, func.bind(undefined, this));
        });
    }

    loadGetHandlers() {
        this.express.use('/', express.static('public'));
    }

    async loadDatabase() {
        this.db = await open({
            filename: path.join('private', 'database.db'),
            driver: sqlite3.Database
        })
    }

    start() {
        if (!fs.existsSync(path.join(__dirname, '..', 'files')))
            fs.mkdirSync(path.join(__dirname, '..', 'files'));

        this.express.listen(this.config.port, () => {
            console.log(`Started on ${this.config.port}.`);
        });
    }
}

module.exports = Server;