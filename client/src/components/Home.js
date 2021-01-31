import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {socket} from '../service/socket';


const Home = () => {
    let history = useHistory();
    const [url, seturl] = useState('');

    useEffect(() => {
        socket.on('error', error => {
            console.log(error);
        })
        
    }, []);

    const join = () => {
        let redirectUrl="";
        if (url !== "") {
            redirectUrl = url.substring(url.lastIndexOf('/'));
            history.push(redirectUrl);
        }
        else {
            socket.emit('create-meet-id');
            socket.on('meet-id', id => {
                console.log(id);
                redirectUrl = `/${id}`;
                console.log('setredurl',redirectUrl)
                history.push(redirectUrl);
            })
        }
    }

    return (
        <>
            <div className="home">
                <div className="container">
                    <div className="title">
                        <h1>UNITE</h1>
                        <p>Video Chat App</p>
                    </div>
                    <div className="row justify-content-center mb-4">
                        <div className="start-meet">
                            <button className="btn " onClick={join}>Start a New Meeting</button>
                        </div>
                    </div>
                    <div className="row justify-content-center mb-4">
                        <div className="col-auto">
                            <h2>Or</h2>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-md-5 mb-4">
                            <input type="text" placeholder="Join Link" className="join-link form-control" onChange={e => { seturl(e.target.value); }}></input>
                        </div>
                        <div className="col-auto mb-4">
                            <div className="join-meet">
                                <button type="" className="btn" onClick={join}>Join Meeting</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Home
