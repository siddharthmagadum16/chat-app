import React, { Fragment, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
function Chat() {
  const chatRef = useRef();
  const chatListRef = useRef();
  const socket = io("http://localhost:4000/");

  // const myPeer = new Peer(sessionStorage.getItem("peerId"), {
  //   host: "localhost",
  //   port: 9000,
  //   path: "/",
  // });

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

  socket.on("chat", (message) => {
    console.log(`this is not been called even if server emitted`); // <- But this doesn't listen to server emit
    appendMessage(message);
  });

  // myPeer.on("open")

  return (
    <Fragment>
      <ul id="chat-list" ref={chatListRef}></ul>
      <input type="text" id="text-input" ref={chatRef}></input>

      <input
        type="button"
        onClick={() => sendMessage(chatRef.current.value)}
        value="Send"
      ></input>
    </Fragment>
  );
}

export default Chat;
