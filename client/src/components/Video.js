import React, { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../service/socket';

let peers = {};

const Video = () => {
    const localVideoref = useRef();
    const { url } = useParams();

    useEffect(() => {

        window.onpopstate = event => {
            // To do
            // leave user from socket room
            console.log(event);
        }

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
            // const videoGrid = document.getElementById("video-grid");
            localVideoref.current.addEventListener('loadedmetadata', () => {
                localVideoref.current.play();
            })
            peer.on('call', call => {
                call.answer(stream);
                peers[call.peer] = call;
                const video = document.createElement('video');
                call.on('stream', userVideoStream => {
                    userVideoStream.oninactive = () => {
                        console.log('stream get inactive')
                    }
                    console.log(userVideoStream)
                    addVideoStream(video, userVideoStream);
                })
                call.on('close', () => {
                    console.log('disconnected');
                    video.remove();
                })
                call.on('error', (error) => {
                    console.log(error);
                })
                call.oniceconnectionstatechange = () => {
                    console.log("ice conne state change")
                }
            })

            socket.on('user-connected', (userId) => {
                console.log("connect to new user", userId);
                connectToNewUser(userId, stream);
            })
        });

        socket.on('user-disconnected', userId => {
            console.log("user disconnected", userId);
            if (peers[userId]) {
                peers[userId].close();
                delete peers[userId];
            }
            let videoGrid = document.getElementById('video-grid');
            changeVideoCss(videoGrid);
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
                userVideoStream.oninactive = () => {
                    console.log('stream get inactive 2')
                }
                addVideoStream(video, userVideoStream);
            });

            call.oniceconnectionstatechange = () => {
                console.log("ice conne state change")
            }

            call.on('close', () => {
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
            changeVideoCss(videoGrid);
        }

        let changeVideoCss = main => {
            let elms = document.getElementById("video-grid").childElementCount;
            let widthMain = main.offsetWidth
            let minWidth = "30%"
            if ((widthMain * 30 / 100) < 300) {
                minWidth = "300px"
            }
            let minHeight = "40%"

            let height = String(100 / elms) + "%"
            let width = ""

            if (elms === 0 || elms === 1) {
                width = "100%"
                height = "100%"
            } else if (elms === 2) {
                width = "45%"
                height = "100%"
            } else if (elms === 3 || elms === 4) {
                width = "35%"
                height = "50%"
            } else {
                width = String(100 / elms) + "%"
            }

            let videos = main.querySelectorAll("video")
            for (let a = 0; a < videos.length; ++a) {
                videos[a].style.minWidth = minWidth
                videos[a].style.minHeight = minHeight
                videos[a].style.setProperty("width", width)
                videos[a].style.setProperty("height", height)
            }

            return { minWidth, minHeight, width, height }
        }

    }, [url])



    return (
        <>
            <div className="video-container">
                <div className="video-main">
                    <div id="video-grid" className="d-flex flex-row justify-content-center flex-wrap">
                        <video ref={localVideoref} id="my-video" style={{border: "5px solid #fae8eb", margin: "10px", objectFit: "fill", width: "100%", height:"100%"}}></video>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Video
