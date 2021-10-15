import React, { Fragment, useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import "./Call.css";

function Call() {
  console.log(`env:  ${process.env.REACT_APP_ENV}`);
  const url =
    process.env.REACT_APP_ENV === "PRODUCTION"
      ? "https://video-chat-heroku-server.herokuapp.com/"
      : "http://localhost:4000/";
  const socket = io(url);

  const myPeer = new Peer(undefined, {
    key: "peerjs",
    debug: 2,
    secure: process.env.REACT_APP_ENV === "PRODUCTION" ? true : false, // secure : false for http connection
  });

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  const peers = {};
  console.log(`${sessionStorage.getItem("roomId")}`); // to be remove later

  useEffect(() => {
    sessionStorage.setItem("number_of_streams", 1);
  }, []);

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream); // self video stream is added
      socket.on("user-connected", (userId) => {
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

  const videolist = useRef();

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    video.className = "video-element";
    let num_of_streams = sessionStorage.getItem("number_of_streams");

    sessionStorage.setItem("number_of_streams", num_of_streams + 1);
    videolist.current.appendChild(video);
  }

  function removeVideoStream(video) {
    videolist.current.removeChild(video);
    let num_of_streams = sessionStorage.getItem("number_of_streams");
    if (num_of_streams > 1)
      sessionStorage.setItem("number_of_streams", num_of_streams - 1);
  }

  // --------chat part --------------------------------------------
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
      chatRef.current.value = "";
    }
  }

  function appendMessage(message) {
    const messageli = document.createElement("li"); // this needs to be converted
    messageli.textContent = `${message}`;
    document.getElementById("chat-list").appendChild(messageli);
    window.scrollTo(0, document.body.scrollHeight);
  }

  function onKeyDownHandler(event) {
    if (event.keyCode === 13) sendMessage(chatRef.current.value);
  }

  let num_of_streams = sessionStorage.getItem("number_of_streams");

  // dynamic styling of video element size --- temporary
  if (num_of_streams === 1) {
    videolist.current.style.width = "1fr";
    videolist.current.style.height = "1fr";
  } else if (num_of_streams > 1 && num_of_streams <= 4) {
    videolist.current.style.width = "2fr";
    videolist.current.style.height = "2fr";
  } else if (num_of_streams > 4 && num_of_streams <= 6) {
    videolist.current.style.width = "2fr";
    videolist.current.style.height = "3fr";
  } else if (num_of_streams > 6 && num_of_streams <= 9) {
    videolist.current.style.width = "3fr";
    videolist.current.style.height = "3fr";
  }

  return (
    <Fragment>
      <div id="call-component">
        <div id="video-component">
          <div id="video-grid" ref={videolist}></div>
        </div>

        <div id="chat-component">
          <ul id="chat-list" ref={chatListRef}></ul>
          <div>
            <input
              type="text"
              id="text-input"
              ref={chatRef}
              onKeyDown={(e) => onKeyDownHandler(e)}
            ></input>
            <input
              type="button"
              onClick={() => sendMessage(chatRef.current.value)}
              value="Send"
            ></input>
          </div>
          <div></div>
        </div>
      </div>
    </Fragment>
  );
}

export default Call;
