import React, { Fragment, useState } from 'react'


function VideoGrid({videoList}){

    return (
        <Fragment>
             <div id="video-grid">
                <ul >
                    {
                        videoList.map((video,index)=>{
                            return <li key={index}> {video} </li>
                        })
                    }
                </ul>
            </div>
        </Fragment>
    )
}

export default VideoGrid