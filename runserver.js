const express = require('express');
const fs = require('fs');
const app = express();

const bodyParser = require('body-parser');
const corser = require('corser');
const static = require('serve-static');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(corser.create());
app.use(static('.'));

app.get('/', function (req, res) {
    console.log('GET /');
    const html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.post('/post', function (req, res) {
    console.log('POST /');
    console.dir(req.body);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('thanks');
});

const host = '0.0.0.0';
const port = process.env.PORT || 9000;
app.listen(port, host);
console.log('Listening at http://localhost:' + port)
