import React, { Fragment, useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import "./Call.css";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import "@mui/styled-engine";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import copyImg from "../Assets/images/copy.png";

function Call() {
  const url =
    process.env.REACT_APP_ENV === "DEVELOPMENT"
      ? "http://localhost:4000/"
      : "https://blue-good-cod.cyclic.app/";
  const socket = io(url);

  const myPeer = new Peer(undefined, {
    key: "peerjs",
    debug: 2,
    secure: process.env.REACT_APP_ENV === "DEVELOPMENT" ? false : true, // secure : false for http connection
  });

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  const peers = {};

  useEffect(() => {
    sessionStorage.setItem("number_of_streams", 0);
    return function cleanup() {
      sessionStorage.setItem("number_of_streams", 0);
    };
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
    // decreaseByOne();
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    // video.className = "video-element";
    let num_of_streams = Number(sessionStorage.getItem("number_of_streams"));
    num_of_streams += 1;
    sessionStorage.setItem("number_of_streams", num_of_streams);
    videolist.current.appendChild(video);
    // videolist.current.className = `stream${num_of_streams}`;
  }

  function removeVideoStream(video) {
    videolist.current.removeChild(video);
    let num_of_streams = Number(sessionStorage.getItem("number_of_streams"));
    if (num_of_streams > 1) {
      num_of_streams -= 1;
      sessionStorage.setItem("number_of_streams", num_of_streams);
    }
  }

  // --------chat part --------------------------------------------
  const chatRef = useRef();
  const chatListRef = useRef();

  socket.on("chat", (message) => {
    appendMessage(message);
  });

  function sendMessage(message) {
    if (message) {
      appendMessage(message, true);
      console.log(`sendMessage: ${message}`);
      socket.emit("new-message", sessionStorage.getItem("roomId"), message);
      chatRef.current.value = "";
    }
  }

  function appendMessage(message, self) {
    const messageli = document.createElement("li"); // this needs to be converted
    messageli.textContent = `${message}`;
    if (self === true) messageli.className = "message selfmsg";
    else messageli.className = "message";
    document.getElementById("chat-list").appendChild(messageli);
    // window.scrollTo(0, document.body.scrollHeight);
    let chat_list = document.getElementById("chat-list");
    chat_list.scrollTop = chat_list.scrollHeight;
  }

  function onKeyDownHandler(event) {
    if (event.keyCode === 13) sendMessage(chatRef.current.value);
  }

  function copyRoomIdToClipboard() {
    let newClip = sessionStorage.getItem("roomId");
    navigator.clipboard.writeText(newClip).then(
      function () {
        console.log("copied to clipboard");
      },
      function () {
        console.log("Clipboard copy failed");
      }
    );
  }

  return (
    <Fragment>
      <div id="call-component">
        <div id="video-component">
          <div id="video-list" ref={videolist}></div>
          <Box class="footer">
            <Button
              id="leavebtn"
              variant="contained"
              // disableElevation
              onClick={() => window.history.back()}
            >
              Leave
            </Button>
          </Box>
        </div>

        <div id="chat-component">
          <div id="room-info">
            Room code:
            <span id="roomId"> {sessionStorage.getItem("roomId")} </span>
            <img
              src={copyImg}
              id="copy"
              onClick={() => {
                copyRoomIdToClipboard();
              }}
              alt="copy"
            />
          </div>
          {/* {/* */}
          <ul id="chat-list" ref={chatListRef}></ul>
          <Box id="chat-input" component="div">
            <TextField
              sx={{ width: "260px" }}
              autoFocus
              id="standard-basic"
              inputRef={chatRef}
              onKeyDown={(e) => onKeyDownHandler(e)}
              label="Type a message"
              variant="standard"
            />

            <Button
              id="sendbtn"
              variant="contained"
              disableElevation
              onClick={() => sendMessage(chatRef.current.value)}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
          {/* */}
        </div>
      </div>
    </Fragment>
  );
}

export default Call;
