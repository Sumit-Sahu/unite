import React, { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../service/socket';

let peers = {};

const Video = () => {
    const localVideoref = useRef();
    const {url} = useParams();

    useEffect(() => {

        socket.on('error', error => {
            console.log(error);
        })

        let peer = new window.Peer(undefined, {
            // path:'/peerjs',
            // host: location.hostname,
            // port: location.port || (location.protocol === 'https:' ? 443 : 80)
        });

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            localVideoref.current.srcObject = stream;
            localVideoref.current.addEventListener('loadedmetadata', () => {
                localVideoref.current.play();
            })
            peer.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream);
                })
                call.on('close', () => {
                    console.log('disconnected');
                })
                call.on('error', (error) => {
                    console.log(error);
                })
            })

            socket.on('user-connected', (userId) => {
                console.log("connect to new user", userId);
                connectToNewUser(userId, stream);
            })
        });

        socket.on('user-disconnected', userId => {
            console.log("user disconnected",userId);
            if(peers[userId]) peers[userId].close();
        });

        peer.on('open', id => {
            const ROOM_ID = url;
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
                console.log('closed call');
            });

            call.on('error', (error) => {
                console.log(error);
            })
        
            peers[userId] = call;
        }

        const addVideoStream = (video, stream) => {
            const videoGrid = document.getElementById("video-grid");
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            })
            videoGrid.append(video);
        }

    }, [url])



    return (
        <div id="video-grid">
            <video ref={localVideoref} id="my-video"></video>
        </div>
    )
}

export default Video
