import React, { useEffect, useRef, useState } from 'react'
import { TextField, Button } from '@mui/material';


import "../styles/videoComponent.css";

import styles from "../styles/videoComponent.module.css";

const server_url="http://localhost:8000";

var connections ={};

const peerConfigConnection = {
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

    let [showModal,setModal] =useState();

    let [screeAvailable , setScreenAvailable] =useState();

    let [messages,setMessages] = useState([]);

    let [message,setMessage] = useState("");

    let [newMessages , setNewMessages] = useState(0);

    let [askForUsername ,setAskForUsername] = useState(true);

    let [username,setUsername]=useState("");

    const videoRef = useRef([]);

    let [videos,setvideos] = useState({});

    //Only works in chromium based browsers but now all browsers support this
  // if (isChrome()=== false) {
    
  // }

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
      if (videoPermission) {
        setVideoAvailable(true);
      }
      else setVideoAvailable(false);

      const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
      if (audioPermission) {
        setAudioAvailable(true);
      }
      else setAudioAvailable(false);

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }
      else setScreenAvailable(false);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }

    } catch (error) {
      console.log(error);
      
    }
  }

  useEffect(() => {
    getPermissions();
  },[]);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.log(error);
      
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for(let id in connections){
      if (id === socketIdRef.current) {
        continue;
      }
      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() =>{
            socketIdRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
          })
          .catch(e => console.log(e))
      })
    }

    stream.getTracks().forEach( track => track.onended =() =>{
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current?.srcObject?.getTracks();
        tracks.forEach(track => track.stop())
      } catch (error) {
        console.log(error);
      }
      //BlackSilence

      let blackSilence = (...args) => new MediaStream([black(...args),silence()]);
       window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for(let id in connections){
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) =>{
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections}))
            }).catch(e => console.log(e))
        })
      }

    })

  }

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.creatMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0],{enabled : false});
  }

  let black = ({width=640 ,height=480} = {} ) => {
    let canvas = Object.assign(document.createElement("canvas"),{width,height});

    canvas.getContext('2d').fillRect(0,0,width,height);

    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0],{ enabled : false});
  }

  let getUserMedia = () => {
    if ( (video && videoAvailable) || (audio && audioAvailable) ) {
      navigator.mediaDevices.getUserMedia({video:video,audio:audio})
        .then(getUserMediaSuccess) //Responsible for swtiching camera off then only audio will be transmitted and vice versa
        .then((stream) => {})
        .catch((e) => console.log(e)
        )
    }else{
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (error) {
        console.log(error);
        
      }
    }
  }

  useEffect(() => {
    if (video!==undefined && audio !==undefined ) {
      getUserMedia();
    }
  },[audio,video]);

  let gotMessageFromServer = (fromId,message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              
              connections[fromId].createAnswer().then((description) =>{
                connections[fromId].setLocalDescription(description).then(() =>{
                  socketIdRef.current.emit("signal",fromId ,JSON.stringify({"sdp":connections[fromId].localDescription}))
                }).catch( e => console.log(e))
              }).catch( e => console.log(e)
            )
            }
          }).catch( e => console.log(e)
        )
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e =>console.log(e)
        )
      }
    }
  }

  let addMessage=() =>{

  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url,{secure:false});
    socketRef.current.on('signal',gotMessageFromServer);

    socketRef.current.on("connect",() => {
      socketRef.current.emit("join-call",window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message",addMessage);

      socketRef.current.on("user-left" , (id) =>{
        setVideo((video) => videos.filter((video) => video.socketId !==id))
      })

      socketRef.current.on("user-joined",(id,clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnection);

          connections[socketListId].onicecandidate = (event) => { //ice => Interactive Connectivity Establishment is somply a protocol as a whole forms a direct cinnection between two clients
            if (event.candidate!= null) {
              socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}));
            }
          }

          connections[socketListId].onaddStream = (event) => {
            
            let videoExists = videoRef.current.find(video => video.socketId ===socketListId);

            if (videoExists) {
              const updateVideos = videos.map(video => 
                  video.socketId === socketListId ? {...video , stream: event.stream} : video
              );
              videoRef.current = updateVideos;
              return updateVideos;
            } else{

              let newVideo = {
                socketId:socketListId,
                stream:event.stream,
                autoPlay:true,
                playsinline:true
              }

              setvideos(videos => {
                const updatedVideos = [...videos,newVideo];
                videoRef.current=updatedVideos;
                return updatedVideos;
              })

            }
              
            }

            if (window.localStream !==undefined && window.localStream!==null) {
              connections[socketListId].addStream(window.localStream);
            }
            else {
              //Black screen in case video is turned off using canvas
              // let blackSilence
              let blackSilence = (...args) => new MediaStream([black(...args),silence()]);
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream);
            }

          })

          if (id === socketIdRef.current) {
            for(let id2 in connections){
              if (id2 === socketIdRef.current) {
                continue;
              }
              try {
                connections[id2].addStream(window.localStream)
              } catch (error) {
                console.log(error);
              }
              connections[id2].createOffer().then((description) =>{
                connections[id2].setLocalDescription(description)
                  .then(() =>{                                        //Session Description means sdp 
                    socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}))
                  })
                  .catch(e => console.log(e))
              })
            }
          }

        })
      })
    }
  

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    // connectToSocketServer();
  }

  let connect = () =>{
    setAskForUsername(false);
    getMedia();
  }


  return (
    <div> 
      
    {askForUsername === true ? 
    
      <div>
        <h2>Enter into lobby</h2>
        <TextField id="outlined-basic" label="Username" value={username} onChange={e=>setUsername(e.target.value)} variant="outlined" />
        <Button variant="contained" onClick={connect}  >Connect</Button>

        <div>
          <video  ref={localVideoRef} autoPlay muted ></video>
        </div>

      </div> :

      <div className={styles.meetVideoContainer} > 
      
      <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay ></video>

      { videos.map( (video) => (
        <div key={video.socketId}> 
            <h2>{video.socketId}</h2>

            <video data-socket={video.socketId} 
            ref = { ref => {
              if (ref && video.stream) {
                ref.srcObject = video.stream;
              }
            }}
            autoPlay
            ></video>
        </div>
      ))}

      </div>
    
    }

    </div>
  )
}
