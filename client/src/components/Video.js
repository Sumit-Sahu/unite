import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { socket } from '../service/socket';

let peers = {};

const Video = () => {
    let history = useHistory();
    const localVideoref = useRef();
    const messageref = useRef("");
    const { url } = useParams();
    const [chat, setchat] = useState({ open: false })
    const [messages, setmessages] = useState([]);
    const [videoGridStyle, setvideoGridStyle] = useState({
        width: "100%"
    });
    const [chatStyle, setchatStyle] = useState({ width: "100%" });
    const [style, setstyle] = useState({
        flexDirection: "row"
    })

    const handleChatChange = useCallback(e => {
        if (e.matches) {
            if (chat.open) {
                setvideoGridStyle({
                    width: "75%"
                });
                setchatStyle({
                    width: "25%"
                });
                setstyle({
                    flexDirection: "row"
                })
            }
            else {
                setvideoGridStyle({
                    width: "100%"
                });
                setchatStyle({
                    width: "100%"
                });
                setstyle({
                    flexDirection: "column"
                })
            }

        }
        else {
            setvideoGridStyle({
                width: "100%"
            });
            setchatStyle({
                width: "100%"
            });
            setstyle({
                flexDirection: "column"
            })
        }
    },[chat])


    useEffect(() => {
        window.onpopstate = () => {
            socket.emit('leave-room');
        }

        socket.on('createMessage', message => {
            setmessages([...messages, message]);
        })

    }, [messages]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        handleChatChange(mediaQuery)
    }, [chat, handleChatChange])

    useEffect(() => {
        // const handleChatChange = e => {
        //     console.log(e.matches)
        //     if (e.matches) {
        //         if (chat.open) {
        //             setvideoGridStyle({
        //                 width: "75%"
        //             });
        //             setchatStyle({
        //                 width: "25%"
        //             });
        //             setstyle({
        //                 flexDirection: "row"
        //             })
        //         }
        //         else {
        //             setvideoGridStyle({
        //                 width: "100%"
        //             });
        //             setchatStyle({
        //                 width: "100%"
        //             });
        //             setstyle({
        //                 flexDirection: "column"
        //             })
        //         }

        //     }
        //     else {
        //         setvideoGridStyle({
        //             width: "100%"
        //         });
        //         setchatStyle({
        //             width: "100%"
        //         });
        //         setstyle({
        //             flexDirection: "column"
        //         })
        //     }
        // }
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        mediaQuery.addEventListener('change', handleChatChange)
    },[handleChatChange])


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



    const handleAudio = (e) => {
        // console.log(e.target.innerHTML,localVideoref.current.srcObject.getAudioTracks()[0].enabled)
        if (!localVideoref.current) return;
        const enabled = localVideoref.current.srcObject.getAudioTracks()[0].enabled;
        if (enabled) {
            localVideoref.current.srcObject.getAudioTracks()[0].enabled = false;
            e.target.innerHTML = "mic_off";
        }
        else {
            localVideoref.current.srcObject.getAudioTracks()[0].enabled = true;
            e.target.innerHTML = "mic";
        }
    }

    const handleVideoCam = (e) => {
        if (!localVideoref.current) return;
        const enabled = localVideoref.current.srcObject.getVideoTracks()[0].enabled;
        if (enabled) {
            localVideoref.current.srcObject.getVideoTracks()[0].enabled = false;
            e.target.innerHTML = "videocam_off";
        }
        else {
            localVideoref.current.srcObject.getVideoTracks()[0].enabled = true;
            e.target.innerHTML = "videocam";
        }
    }

    const handleCallEnd = () => {
        socket.emit('leave-room');
        // socket.disconnect();
        if (localVideoref.current && localVideoref.current.srcObject) {
            localVideoref.current.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        history.push('/');

    }

    const handleChat = () => {
        if (chat.open) {
            setchat({ open: false });
        }
        else {
            setchat({ open: true });
        }
    }

    const sendMessage = e => {
        let message = messageref.current.value;
        if (message !== "")
            socket.emit('message', message);
        messageref.current.value = "";
    }

    const copyUrl = () => {
        let text = window.location.href
        if (!navigator.clipboard) {
            let textArea = document.createElement("textarea")
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            try {
                document.execCommand('copy')
                window.confirm("Link copied to clipboard!")
            } catch (err) {
                window.confirm("Failed to copy")
            }
            document.body.removeChild(textArea)
            return
        }
        navigator.clipboard.writeText(text).then(function () {
            window.confirm("Link copied to clipboard!")
        }, () => {
            window.confirm("Failed to copy")
        })
    }


    return (
        <>
            <div className="video-container">
                <div className="container invite-link d-flex justify-content-center">
                    <div className="col-md-6 input-group mt-2 mb-md-2">
                        <input disabled={true} className="form-control" value={window.location.href} aria-describedby="basic-addon2" ></input>
                        <button className="input-group-addon btn" id="basic-addon2" onClick={e => copyUrl()}>Copy Invite Link</button>
                    </div>
                </div>
                <div className="d-flex" style={style} >
                    <div className="video-main" style={videoGridStyle}>
                        <div id="video-grid" className="d-flex flex-row justify-content-center flex-wrap" >
                            <video ref={localVideoref} id="my-video" style={{ border: "5px solid #fae8eb", margin: "10px", objectFit: "fill", width: "100%", height: "100%" }}></video>
                        </div>
                    </div>

                    <div id="chat" className="collapse position-relative" style={{ border: "solid 5px", ...chatStyle }}>
                        <div>
                            <h2>Chat</h2>
                        </div>
                        <div>
                            <ul className="messages">
                                {messages.map((message, index) => <li key={index} className="message"><i style={{color:"#E21D12"}}>{`> `}</i>{message}</li>)}
                            </ul>
                        </div>
                        <div className="input-group create-message position-absolute">
                            <input ref={messageref} id="chat-message" className="form-control" type="text" placeholder="message" aria-describedby="basic-addon2" ></input>
                            <div className="input-group-append">
                                <span className="btn" onClick={e => sendMessage(e)} role="button"><span className="material-icons">send</span></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className="video-controls container-fluid position-fixed fixed-bottom">
                <div className="row d-flex justify-content-center">
                    <div className="col-auto">
                        <button className="control-icon btn" onClick={e => handleAudio(e)}><i className="material-icons">mic</i></button>
                    </div>
                    <div className="col-auto">
                        <button className="control-icon btn" onClick={e => handleVideoCam(e)}><i className="material-icons">videocam</i></button>
                    </div>
                    <div className="col-auto">
                        <button className="control-icon btn" onClick={e => handleCallEnd()}><i className="material-icons" style={{ color: "#e5383b" }}>call_end</i></button>
                    </div>
                    <div className="col-auto">
                        <button href="#chat" className="control-icon btn" data-toggle="collapse" onClick={e => handleChat()}><i className="material-icons" style={{}}>chat</i></button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Video
