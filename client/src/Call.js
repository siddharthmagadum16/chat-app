import React, { Fragment, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import "./Call.css";

function Call() {
  const socket = io("http://localhost:4000/");

  const myPeer = new Peer(undefined, {
    host: "localhost",
    port: 9000,
    path: "/",
  });

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  const peers = {};

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream); // self video stream is added
      socket.on("user-connected", (userId) => {
        console.log(`user connected from Call.js`);
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
    console.log(`NEW message: ${message}`);
    document.getElementById("chat-list").appendChild(messageli);
    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <Fragment>
      <div id="video-grid"> </div>
      <div>{sessionStorage.getItem("roomId")}</div>
      <div>
        <ul id="chat-list" ref={chatListRef}></ul>
        <input type="text" id="text-input" ref={chatRef}></input>

        <input
          type="button"
          onClick={() => sendMessage(chatRef.current.value)}
          value="Send"
        ></input>
      </div>
    </Fragment>
  );
}

export default Call;
