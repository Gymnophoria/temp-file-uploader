const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

if (!fs.existsSync(path.join('.', 'files'))) fs.mkdirSync(path.join('.', 'files'));

const app = express();

app.use('/', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Started on ${PORT}.`);
})