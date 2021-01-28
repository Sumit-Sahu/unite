const socket = io();
socket.on('error', error => {
    console.log(error);
})

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement('video');
myVideo.muted = true; 
var peer = new Peer(undefined, {
    // path:'/peerjs',
    // host: location.hostname,
    // port: location.port || (location.protocol === 'https:' ? 443 : 80)
});

const peers = {};
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    myVideoStream = stream;
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
});

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

peer.on('error', (error) => {
    console.log(error);
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', ()=> {
        video.remove();
    });

    peers[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

