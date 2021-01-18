const app = require('express')();
const server = require('http').Server(app);

app.get('/', (req, res) => {
    res.status(200).send("zoom clone");
})







server.listen(3000);