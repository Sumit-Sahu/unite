const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});
const { v4 } = require('uuid');
// const { ExpressPeerServer } = require('peer');

// const peerServer = ExpressPeerServer(server, {
//     debug: true
// });

app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use('/peerjs', peerServer);


app.get('/', (req, res) => {
    res.redirect(`/${v4()}`);
})

app.get('/:room', (req, res) => {
    // console.log("get request");
    res.render('room', { roomId: req.params.room });
})

io.on('connection', (socket) => {
    console.log("new connection");
    socket.on("join-room", (roomId, userId) => {
        // console.log(roomId," ",userId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', ()=> {
            console.log("user disconnected",userId);
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });

        socket.on('leave-room', () => {
            socket.leave(roomId);
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });

        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        }); 
    });
    socket.on("create-meet-id", () => {
        console.log('id created')
        let id=v4()
        socket.emit('meet-id', id);
    });
})



server.listen(3001);