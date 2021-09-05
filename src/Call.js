import React, { Fragment, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import "./Call.css";

function Call() {

  console.log(`env:  ${process.env.REACT_APP_ENV}`)
  const url= process.env.REACT_APP_ENV==="PRODUCTION" ? "https://video-chat-heroku-server.herokuapp.com/" : "http://localhost:4000/";
  const socket = io(url);

  const myPeer = new Peer(undefined, {
    host: process.env.REACT_APP_ENV==="PRODUCTION" ? "video-chat-heroku-server.herokuapp.com" : "localhost",
    port: 9000,
    path: "peerjs/peerserver",
  });

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  const peers = {};
  console.log(`${sessionStorage.getItem("roomId")}`); // to be remove later

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream); // self video stream is added
      socket.on("user-connected", (userId) => {
        // const objkeys = Object.keys(peers);
        // setgridLayout(`size${objkeys.length}`);
        connectToNewUser(userId, stream);
      });

      myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream); // incoming videostream is added
        });
      });
    });

  myPeer.on("open", (id) => {
    console.log(`peerId: ${id}`);
    sessionStorage.setItem("peerId", `${id}`);
    socket.emit("join-room", sessionStorage.getItem("roomId"), id);
  });

  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
  });

  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      removeVideoStream(video);
      video.remove();
    });

    peers[userId] = call;
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    const grid = document.getElementById("video-grid");
    grid.appendChild(video);
  }

  function removeVideoStream(video) {
    const grid = document.getElementById("video-grid");
    grid.removeChild(video);
  }

  // --------chat part ---------------
  const chatRef = useRef();
  const chatListRef = useRef();

  socket.on("chat", (message) => {
    appendMessage(message);
  });

  function sendMessage(message) {
    if (message) {
      appendMessage(message);
      console.log(`sendMessage: ${message}`);
      socket.emit("new-message", sessionStorage.getItem("roomId"), message);
      document.getElementById("text-input").innerHTML = "";
    }
  }

  function appendMessage(message) {
    const messageli = document.createElement("li");
    messageli.textContent = `${message}`;
    document.getElementById("chat-list").appendChild(messageli);
    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <Fragment>
      <div id="call-component">
        <div id="video-component">
          <ul id="video-grid"></ul>
        </div>

        <div id="chat-component">
          <ul id="chat-list" ref={chatListRef}></ul>
          <div>
            <input type="text" id="text-input" ref={chatRef}></input>
            <input
              type="button"
              onClick={() => sendMessage(chatRef.current.value)}
              value="Send"
            ></input>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default Call;
