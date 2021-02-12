const http = require('http');
const d = {
    name: 'Lol',
    type: 'Grass',
};
const s = JSON.stringify(d);
const o = {
    host: 'localhost',
    port: 8000,
    path: '/pokemon/4',
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(s),
    },
};
let rb = '';
const req = http.request(o, (res) => {
    res.on('data', (ch) => (rb += ch));
    res.on('end', () => console.log(JSON.parse(rb)));
});
req.on('error', (err) => console.log(err));
req.write(s);
req.end();
