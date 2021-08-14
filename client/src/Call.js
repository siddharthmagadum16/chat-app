import React, { Fragment, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Peer from 'peerjs'
import VideoGrid from './VideoGrid'

function Call(){

    const socket = io('http://localhost:4000/')


    const myPeer = new Peer(undefined, {
            host: 'localhost',
            port: 9000,
            path: '/'
    })

    const myVideo = document.createElement('video')
    myVideo.muted= true
    const peers={}

    navigator.mediaDevices.getUserMedia({
        video : true,
        audio : true
    }).then(stream=>{
        addVideoStream(myVideo, stream)

        socket.on('user-connected',userId =>{
            connectToNewUser(userId,stream)
        })

        myPeer.on('call',call=>{
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream',userVideoStream=>{
                addVideoStream(video, userVideoStream)
            })

            call.on('close',()=>{
                video.remove()
            })
        })
    })

    myPeer.on('open',id =>{
        socket.emit('join-room',sessionStorage.getItem("roomId"), id)
    })


    socket.on('user-disconnected',userId=>{
        if(peers[userId]) peers[userId].close()
    })

    function connectToNewUser(userId, stream){
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video')
        call.on('stream',userVideoStream =>{
            addVideoStream(video, userVideoStream)
        })
        call.on('close',()=>{
            video.remove()
        })
    }

    // const [childList, setChildList] = useState([])

    function addVideoStream(video, stream){
        video.srcObject = stream
        video.addEventListener('loadedmetadata',()=>{
            video.play()
        })

        const grid=document.getElementById("video-grid")
        grid.appendChild(video)
    }



    return (
        <Fragment>

            <div id="video-grid">
                <ul id="list"></ul>
            </div>
        </Fragment>
    )
}

export default Call