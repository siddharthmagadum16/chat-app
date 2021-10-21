import React, { Fragment, useRef } from "react";
import axios from "axios";

function Home() {
  const roomRef = useRef();

  function createRoom() {
    const url =
      process.env.REACT_APP_ENV === "PRODUCTION"
        ? "https://video-chat-heroku-server.herokuapp.com/"
        : "http://localhost:4000/";
    axios(url, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        sessionStorage.setItem("roomId", res.data);
        window.location.href = `/${res.data}`;
      })
      .catch((err) => console.log(err));
  }

  function joinRoom(roomId) {
    sessionStorage.setItem("roomId", roomId);
    window.location.href = `/${roomId}`;
  }
  return (
    <Fragment>
      <div>
        <input type="button" onClick={createRoom} value="Enter Room"></input>
        <div>
          <div>OR</div>
          <div>Copy and Enter room code provided in joined room</div>
          <input
            type="text"
            id="roomid-input"
            placeholder="Enter room code provided in joined room"
            ref={roomRef}
          ></input>
          <input
            type="button"
            onClick={() => joinRoom(roomRef.current.value)}
            value="Join Room"
          ></input>
        </div>
      </div>
    </Fragment>
  );
}

export default Home;
