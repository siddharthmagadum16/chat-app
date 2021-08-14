import React, { Fragment } from 'react'
import axios from 'axios'

function Home(){

    function enterRoom() {

        axios('http://localhost:4000',{
          method: 'GET',
          mode : 'cors',
        })
        .then(res=>{
            console.log(res.data)
            sessionStorage.setItem("roomId",res.data)
            window.location.href= `/${res.data}`
        })

        .catch(err=> console.log(err))

    }
    return (
        <Fragment>
            <div>hello</div>
            <div>
                <input type="button" onClick={enterRoom} value="Enter Room" ></input>
            </div>
        </Fragment>
    )
}

export default Home