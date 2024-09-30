import React, { useRef, useState } from 'react'

import "../styles/videoComponent.css";

const server_url="http://localhost:8000";

var connections ={};

const peerConfigConnections = {
    "iceServers":[
        {"urls":"stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent(){

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable , setVideoAvailable]= useState(true);
    let [audioAvailable , setAudioAvailable]= useState(true);

    let [video,setVideo] = useState();

    let [audio,setAudio] = useState();

    let [screen,setScreen] = useState();

    let [showModa,setModal] =useState();

    let [screeAvailable , setScreenAvailable] =useState();

    let [messages,setMessages] = useState([]);

    let [message,setMessage] = useState("");

    let [newMessages , setNewMessages] = useState(0);

    let [askForUsername ,setUsername] = useState(true);

    let [username,setAskForUsername]=useState("");

    const videoRef = useRef([]);

    let [videos,setvideos] = useState({});

    //Only works in chromium based browsers but now all browsers support this
  // if (isChrome()=== false) {
    
  // }


  return (
    <div> 
      
    {askForUsername === true ? 
    
      <div>

      

      </div> :

      <></>
    
    }

    </div>
  )
}
