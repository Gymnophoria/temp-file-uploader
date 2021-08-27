const { randomBytes } = require('crypto');

const MAX_EXPIRY = 1000 * 60 * 60 * 24 * 7 * 2;
const MAX_FILESIZE = 2000000000; // 2 GB

const reducer = (accum, cur) => accum + cur.size;

module.exports = (server, req, res, next) => {
    if (!req.body)
        return res.status(400).send();

    if (req.body.password !== server.password.text)
        return res.status(401).send('Invalid password.');

    if (req.body.expiry >= MAX_EXPIRY)
        return res.status(400).send('Invalid expiry.');

    if (!req.body.files || !(req.body.files instanceof Array) || files.length == 0)
        return res.status(400).send('No files provided.');

    if (req.body.files.reduce(reducer, 0) > MAX_FILESIZE)
        return res.status(400).send('More than 2 GB of files provided.');

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // TODO: ratelimit via IP
    const expiry = Date.now() + req.body.expiry + 10 * 1000; // add 10 seconds grace
    
    req.body.files.forEach(file => {
        const key = randomBytes(12).toString('hex');

        // next up: deal with storing in DB then send back key
    });

    console.log(req.body);
};