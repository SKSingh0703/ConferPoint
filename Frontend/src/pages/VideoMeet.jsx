import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import ShareIcon from '@mui/icons-material/Share'
import HelpIcon from '@mui/icons-material/Help'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import "../styles/video.css"
import server from '../environment';
import PreMeetingScreen from '../components/PreMeetingScreen';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const routeTo = useNavigate();

    // Global cleanup function to stop all media tracks
    const cleanupAllTracks = useCallback(() => {
        console.log('🧹 GLOBAL CLEANUP: Stopping all media tracks');
        
        // Stop window.localStream tracks
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                console.log('🧹 Stopping window.localStream track:', track.id, track.kind);
                track.enabled = false;
                track.stop();
            });
            window.localStream = null;
        }
        
        // Stop video element tracks
        if (localVideoref.current && localVideoref.current.srcObject) {
            const stream = localVideoref.current.srcObject;
            if (stream && stream.getTracks) {
                stream.getTracks().forEach(track => {
                    console.log('🧹 Stopping video element track:', track.id, track.kind);
                    track.enabled = false;
                    track.stop();
                });
            }
            localVideoref.current.srcObject = null;
        }
        
        // Close any peer connections
        Object.values(connections).forEach(connection => {
            if (connection && connection.close) {
                console.log('🧹 Closing peer connection');
                connection.close();
            }
        });
        
        console.log('🧹 ✅ ALL TRACKS CLEANED UP');
    }, []);

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);

    let [audio, setAudio] = useState(true);

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // Share and Help modal states
    let [shareModalOpen, setShareModalOpen] = useState(false)
    let [helpModalOpen, setHelpModalOpen] = useState(false)
    let [copySuccess, setCopySuccess] = useState(false)

    // Get meeting code from URL
    const meetingCode = window.location.pathname.substring(1);

    // Share meeting functionality
    const handleShareMeeting = () => {
        setShareModalOpen(true);
    };


    const handleHelp = () => {
        setHelpModalOpen(true);
    };

    // Handle picture-in-picture functionality
    const handlePictureInPicture = async () => {
        if (localVideoref.current) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await localVideoref.current.requestPictureInPicture();
                }
            } catch (error) {
                console.log('Picture-in-picture not supported or failed:', error);
            }
        }
    };

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Escape key to exit picture-in-picture
            if (event.key === 'Escape' && document.pictureInPictureElement) {
                document.exitPictureInPicture();
            }
            // Ctrl/Cmd + P for picture-in-picture toggle
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                handlePictureInPicture();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    // Debug video element size
    useEffect(() => {
        const debugVideoSize = () => {
            if (localVideoref.current) {
                const computedStyle = window.getComputedStyle(localVideoref.current);
                const screenWidth = window.innerWidth;
                console.log('🔍 Video Element Debug:');
                console.log('  - Screen Width:', screenWidth, 'px');
                console.log('  - Using Mobile CSS:', screenWidth <= 768);
                console.log('  - CSS Width:', computedStyle.width);
                console.log('  - CSS Height:', computedStyle.height);
                console.log('  - Client Width:', localVideoref.current.clientWidth);
                console.log('  - Client Height:', localVideoref.current.clientHeight);
                console.log('  - Offset Width:', localVideoref.current.offsetWidth);
                console.log('  - Offset Height:', localVideoref.current.offsetHeight);
                console.log('  - Video Width:', localVideoref.current.videoWidth);
                console.log('  - Video Height:', localVideoref.current.videoHeight);
                console.log('  - Position:', computedStyle.position);
                console.log('  - Transform:', computedStyle.transform);
                console.log('  - Z-index:', computedStyle.zIndex);
                console.log('  - Chat Open:', showModal);
            }
        };

        // Debug after a short delay to ensure DOM is ready
        setTimeout(debugVideoSize, 1000);
        
        // Also debug when video loads
        const videoElement = localVideoref.current;
        if (videoElement) {
            videoElement.addEventListener('loadeddata', debugVideoSize);
            return () => videoElement.removeEventListener('loadeddata', debugVideoSize);
        }
    }, [showModal]);

    // Log when chat state changes
    useEffect(() => {
        console.log('💬 Chat state changed:', showModal ? 'OPEN' : 'CLOSED');
        if (localVideoref.current) {
            setTimeout(() => {
                console.log('📐 Video size after chat change:', localVideoref.current?.clientWidth, 'x', localVideoref.current?.clientHeight);
            }, 600); // Wait for transition to complete
        }
    }, [showModal]);

    // Ensure video element gets the stream when availables
    useEffect(() => {
        if (localVideoref.current && window.localStream) {
            console.log('🎥 Setting video element srcObject from useEffect');
            console.log('🎥 Stream active:', window.localStream.active);
            console.log('🎥 Stream video tracks:', window.localStream.getVideoTracks().length);
            console.log('🎥 Stream audio tracks:', window.localStream.getAudioTracks().length);
            
            localVideoref.current.srcObject = window.localStream;
            localVideoref.current.autoplay = true;
            localVideoref.current.muted = true;
            localVideoref.current.playsInline = true;
            localVideoref.current.load();
        }
    }, [videoAvailable, audioAvailable]);

    // TODO
    // if(isChrome() === false) {


    // }

    const getPermissions = useCallback(async () => {
        try {
            // Request permissions for both video and audio
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            if (stream) {
                // Set both as available initially
                setVideoAvailable(true);
                setAudioAvailable(true);
                setVideo(true);
                setAudio(true);
                
                // Store the stream globally
                window.localStream = stream;
                
                // Set the video element source
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
                
                console.log('Permissions granted and stream set up');
            }
            
            // Check for screen sharing support
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

        } catch (error) {
            console.log('Permission error:', error);
            
            // If permission denied, try to get what we can
            try {
                const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setVideoAvailable(true);
                setAudioAvailable(false);
                setVideo(true);
                setAudio(false);
                window.localStream = videoOnly;
                    if (localVideoref.current) {
                    localVideoref.current.srcObject = videoOnly;
                }
            } catch (videoError) {
                console.log('Video permission denied:', videoError);
                try {
                    const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setVideoAvailable(false);
                    setAudioAvailable(true);
                    setVideo(false);
                    setAudio(true);
                    window.localStream = audioOnly;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = audioOnly;
                    }
                } catch (audioError) {
                    console.log('All permissions denied:', audioError);
                    setVideoAvailable(false);
                    setAudioAvailable(false);
                    setVideo(false);
                    setAudio(false);
                }
            }
        }
    }, []);

    const getDislayMedia = useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => console.log(e))
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen, username]);

    const getUserMedia = useCallback(() => {
        console.log('📹 ===========================================');
        console.log('📹 === GET USER MEDIA CALLED ===');
        console.log('📹 ===========================================');
        console.log('📹 videoAvailable:', videoAvailable);
        console.log('📹 window.localStream exists:', !!window.localStream);
        console.log('📹 localVideoref.current exists:', !!localVideoref.current);
        console.log('📹 videos array length:', videos.length);
        console.log('📹 socketIdRef.current:', socketIdRef.current);
        
        // This function is called when joining the meeting or when video state changes
        // We should use the current stream state
        if (window.localStream && window.localStream.active) {
            console.log('📹 Using existing active stream for getUserMedia');
            console.log('📹 Existing stream video tracks:', window.localStream.getVideoTracks().length);
            console.log('📹 Existing stream audio tracks:', window.localStream.getAudioTracks().length);
            getUserMediaSuccess(window.localStream);
        } else {
            console.log('📹 No existing stream, requesting new one');
            // Get new stream with video only - audio is handled separately
            navigator.mediaDevices.getUserMedia({ 
                video: videoAvailable, 
                audio: true // Always request audio initially
            })
                .then(stream => {
                    console.log('📹 ✅ Got new stream for getUserMedia');
                    console.log('📹 New stream video tracks:', stream.getVideoTracks().length);
                    console.log('📹 New stream audio tracks:', stream.getAudioTracks().length);
                    getUserMediaSuccess(stream);
                })
                .catch((e) => {
                    console.log('📹 ❌ Error getting user media:', e);
                    console.log('📹 Trying with minimal permissions...');
                    // Try with minimal permissions
                    navigator.mediaDevices.getUserMedia({ video: false, audio: false })
                        .then(stream => {
                            console.log('📹 Got fallback stream');
                            getUserMediaSuccess(stream);
                        })
                        .catch(error => {
                            console.log('📹 ❌ All permissions failed:', error);
                        });
                });
        }
        console.log('📹 === END GET USER MEDIA ===');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoAvailable]); // Only depends on videoAvailable - getUserMediaSuccess and videos.length are stable

    let getUserMediaSuccess = (stream) => {
        console.log('📹 ===========================================');
        console.log('📹 === GET USER MEDIA SUCCESS ===');
        console.log('📹 ===========================================');
        console.log('📹 Stream received:', stream);
        console.log('📹 Stream active:', stream.active);
        console.log('📹 Stream video tracks:', stream.getVideoTracks().length);
        console.log('📹 Stream audio tracks:', stream.getAudioTracks().length);
        console.log('📹 Stream id:', stream.id);
        console.log('📹 Current videoAvailable state:', videoAvailable);
        console.log('📹 Current audioAvailable state:', audioAvailable);
        
        // Check if stream is active and has tracks
        if (!stream.active) {
            console.log('📹 ❌ Stream is inactive, skipping');
            return;
        }
        
        // Allow audio-only streams (when video is disabled)
        if (stream.getVideoTracks().length === 0 && stream.getAudioTracks().length === 0) {
            console.log('📹 ❌ Stream has no tracks at all, skipping');
            return;
        }
        
        console.log('📹 ✅ Stream is valid - video tracks:', stream.getVideoTracks().length, 'audio tracks:', stream.getAudioTracks().length);
        
        try {
            if (window.localStream) {
                console.log('📹 Stopping existing stream tracks');
                window.localStream.getTracks().forEach(track => {
                    console.log('📹 Stopping existing track:', track.id, track.kind);
                    track.stop();
                });
            }
        } catch (e) { 
            console.log('📹 Error stopping existing tracks:', e); 
        }

        window.localStream = stream;
        console.log('📹 Setting up local stream');
        
        // Update video element if it exists
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
            console.log('📹 ✅ Video element srcObject set successfully');
            
            // Set video element attributes for better compatibility
            localVideoref.current.autoplay = true;
            localVideoref.current.muted = true;
            localVideoref.current.playsInline = true;
            
            // Force video element to refresh
            localVideoref.current.load();
            
            // Add a small delay to ensure the video element processes the new stream
            setTimeout(() => {
                if (localVideoref.current) {
                    localVideoref.current.load();
                    console.log('📹 Video element reloaded after timeout');
                }
            }, 100);
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("🖥️ Screen share started");
        
        // Backup the original camera stream before replacing it
        if (window.localStream && window.localStream.active) {
            console.log('🖥️ Backing up original camera stream');
            window.originalStream = window.localStream.clone();
        }
        
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            console.log('🖥️ Screen share ended, restoring camera stream');
            setScreen(false)

            // Stop screen share tracks
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            // Restore the original camera stream without recreating it
            if (window.originalStream && window.originalStream.active) {
                console.log('🖥️ Restoring original camera stream');
                window.localStream = window.originalStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }
                
                // Update peer connections with the restored stream
                for (let id in connections) {
                    if (id !== socketIdRef.current && connections[id]) {
                        try {
                            // Remove existing tracks and add the restored stream
                            connections[id].getSenders().forEach(sender => {
                                connections[id].removeTrack(sender);
                            });
                            window.localStream.getTracks().forEach(track => {
                                connections[id].addTrack(track, window.localStream);
                            });
                        } catch (e) {
                            console.log('🖥️ Error updating peer connection:', e);
                        }
                    }
                }
            } else {
                console.log('🖥️ No original stream found, creating fallback');
                // Fallback: create a simple black stream
                let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                window.localStream = blackSilence()
                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }
            }
        })
    }

    const gotMessageFromServer = useCallback((fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                console.log('🎥 Received SDP signal from:', fromId, 'Type:', signal.sdp.type);
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        console.log('🎥 Creating answer for offer from:', fromId);
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                                console.log('🎥 Sent answer to:', fromId);
                            }).catch(e => console.log('🎥 Error setting local description:', e))
                        }).catch(e => console.log('🎥 Error creating answer:', e))
                    } else if (signal.sdp.type === 'answer') {
                        console.log('🎥 Received answer from:', fromId);
                    }
                }).catch(e => console.log('🎥 Error setting remote description:', e))
            }

            if (signal.ice) {
                console.log('🎥 Received ICE candidate from:', fromId);
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log('🎥 Error adding ICE candidate:', e))
            }
        }
    }, []);

    const addMessage = useCallback((data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    }, []);

    const connectToSocketServer = useCallback(() => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', { 
                path: window.location.href, 
                username: username 
            })
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients, username) => {
                console.log('🎥 User joined event:', { newUserId: id, allClients: clients, myId: socketIdRef.current, username: username });
                
                // If I'm the new user, create connections with all existing users
                if (id === socketIdRef.current) {
                    console.log('🎥 I am the new user, creating connections with existing participants');
                    
                clients.forEach((socketListId) => {
                        // Skip myself
                        if (socketListId === socketIdRef.current) return;

                        console.log('🎥 Creating connection with existing user:', socketListId);
                        
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                   
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                        };

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                            console.log('🎥 ✅ STREAM RECEIVED from existing user:', socketListId);
                            console.log('🎥 Stream details:', {
                                active: event.stream.active,
                                videoTracks: event.stream.getVideoTracks().length,
                                audioTracks: event.stream.getAudioTracks().length
                            });

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                                console.log('🎥 Updating existing video stream');
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                                console.log('🎥 Creating new video for existing user');
                                const newVideo = {
                                    id: Math.random(),
                                socketId: socketListId,
                                stream: event.stream,
                                    username: `User ${socketListId.slice(0, 5)}` // Will be updated when we get the actual username
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                        
                        // Force a re-render to update the UI
                        setTimeout(() => {
                            console.log('🎥 Forcing re-render after stream update');
                            setVideos(current => [...current]);
                        }, 100);
                        }

                        // Send my stream to the existing user
                        if (window.localStream) {
                            try {
                                connections[socketListId].addStream(window.localStream);
                                console.log('🎥 Added my stream to existing user connection:', socketListId);
                                
                                connections[socketListId].createOffer().then((description) => {
                                    connections[socketListId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'sdp': connections[socketListId].localDescription }));
                                            console.log('🎥 Sent offer to existing user:', socketListId);
                                        })
                                        .catch(e => console.log('🎥 Error setting local description:', e));
                                }).catch(e => console.log('🎥 Error creating offer:', e));
                            } catch (error) {
                                console.log('🎥 Error adding stream to existing user:', error);
                            }
                        }
                    });
                    } else {
                    // I'm an existing user, the new user just joined
                    console.log('🎥 New user joined, I need to send my stream to them:', id);
                    
                    // Create peer connection with the new user
                    connections[id] = new RTCPeerConnection(peerConfigConnections);
                    
                    connections[id].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    // Wait for the new user's video stream
                    connections[id].onaddstream = (event) => {
                        console.log('🎥 ✅ STREAM RECEIVED from new user:', id);
                        console.log('🎥 Stream details:', {
                            active: event.stream.active,
                            videoTracks: event.stream.getVideoTracks().length,
                            audioTracks: event.stream.getAudioTracks().length
                        });
                        
                        let videoExists = videoRef.current.find(video => video.socketId === id);

                        if (videoExists) {
                            console.log('🎥 Updating existing video stream for new user');
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === id ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            console.log('🎥 Creating new video for new user');
                            const newVideo = {
                                id: Math.random(),
                                socketId: id,
                                stream: event.stream,
                                username: username || `User ${id.slice(0, 5)}` // Use the actual username from the event
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                        
                        // Force a re-render to update the UI
                        setTimeout(() => {
                            console.log('🎥 Forcing re-render after stream update');
                            setVideos(current => [...current]);
                        }, 100);
                    };

                    // Send my stream to the new user if I have one
                    if (window.localStream) {
                        try {
                            connections[id].addStream(window.localStream);
                            console.log('🎥 Added my stream to new user connection');
                            // Don't send offer here - let the new user send the offer
                            console.log('🎥 Waiting for offer from new user');
                        } catch (error) {
                            console.log('🎥 Error adding stream to new user:', error);
                        }
                    }
                }
            })
        })
    }, [gotMessageFromServer, addMessage]);

    useEffect(() => {
        console.log("HELLO")
        getPermissions();
    }, [getPermissions]) // Include getPermissions dependency

    // Check if video element needs stream assignment after mount
    useEffect(() => {
        const checkVideoStream = () => {
            if (localVideoref.current && window.localStream && !localVideoref.current.srcObject) {
                console.log('🎥 Video element missing stream, assigning now');
                localVideoref.current.srcObject = window.localStream;
                localVideoref.current.autoplay = true;
                localVideoref.current.muted = true;
                localVideoref.current.playsInline = true;
                localVideoref.current.load();
            }
        };
        
        // Check immediately and after a short delay
        checkVideoStream();
        const timeoutId = setTimeout(checkVideoStream, 1000);
        
        return () => clearTimeout(timeoutId);
    }, []);

    // Cleanup function to stop all tracks when component unmounts
    useEffect(() => {
        // Add beforeunload event listener to cleanup when page is refreshed or closed
        const handleBeforeUnload = () => {
            console.log('🧹 PAGE UNLOADING: Cleaning up tracks');
            cleanupAllTracks();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup on component unmount
        return () => {
            console.log('🧹 CLEANUP: Component unmounting');
            window.removeEventListener('beforeunload', handleBeforeUnload);
            cleanupAllTracks();
        };
    }, [cleanupAllTracks]);

    // Separate useEffect for video state changes only
    useEffect(() => {
        console.log('🔄 ===========================================');
        console.log('🔄 === VIDEO STATE CHANGE USEFFECT ===');
        console.log('🔄 ===========================================');
        console.log('🔄 videoAvailable:', videoAvailable);
        console.log('🔄 videoAvailable !== undefined:', videoAvailable !== undefined);
        
        // Only call getUserMedia when video state changes
        // Audio changes are handled directly in handleAudio without recreating the stream
        if (videoAvailable !== undefined) {
            console.log('🔄 ✅ VIDEO STATE CHANGE DETECTED - calling getUserMedia()');
            console.log('🔄 window.localStream exists:', !!window.localStream);
            if (window.localStream) {
                console.log('🔄 Current stream video tracks:', window.localStream.getVideoTracks().length);
                console.log('🔄 Current stream audio tracks:', window.localStream.getAudioTracks().length);
                console.log('🔄 Current stream active:', window.localStream.active);
            }
            getUserMedia();
            console.log("🔄 ✅ getUserMedia() called with videoAvailable:", videoAvailable);
        } else {
            console.log('🔄 ❌ Video state not ready yet - videoAvailable:', videoAvailable);
        }
        console.log('🔄 ===========================================');
    }, [videoAvailable, getUserMedia]); // Only depends on videoAvailable


    const getMedia = useCallback(() => {
        // Sync the video and audio states with the available states
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoAvailable, audioAvailable]);
















    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    const handleVideo = useCallback(() => {
        console.log('🎥 ===========================================');
        console.log('🎥 === HANDLE VIDEO TOGGLE CALLED ===');
        console.log('🎥 ===========================================');
        console.log('🎥 Current videoAvailable:', videoAvailable);
        console.log('🎥 Current audioAvailable:', audioAvailable);
        console.log('🎥 Current video state:', video);
        console.log('🎥 Current audio state:', audio);
        console.log('🎥 window.localStream exists:', !!window.localStream);
        console.log('🎥 localVideoref.current exists:', !!localVideoref.current);
        console.log('🎥 videos array length:', videos.length);
        console.log('🎥 socketIdRef.current:', socketIdRef.current);
        
        if (window.localStream) {
            console.log('🎥 Current stream video tracks:', window.localStream.getVideoTracks().length);
            console.log('🎥 Current stream audio tracks:', window.localStream.getAudioTracks().length);
            console.log('🎥 Current stream active:', window.localStream.active);
            window.localStream.getVideoTracks().forEach((track, index) => {
                console.log(`🎥 Video track ${index}:`, {
                    id: track.id,
                    enabled: track.enabled,
                    readyState: track.readyState,
                    muted: track.muted
                });
            });
        }
        
        const newVideoState = !videoAvailable;
        console.log('🎥 NEW VIDEO STATE WILL BE:', newVideoState);
        console.log('🎥 ===========================================');
        
        // Update states immediately
        setVideoAvailable(newVideoState);
        setVideo(newVideoState);
        console.log('🎥 ✅ States updated - videoAvailable:', newVideoState, 'video:', newVideoState);
        
        // Control the actual video track
        if (window.localStream) {
            const videoTracks = window.localStream.getVideoTracks();
            console.log('🎥 Current video tracks to process:', videoTracks.length);
            videoTracks.forEach((track, index) => {
                console.log(`🎥 Track ${index}:`, track.id, 'enabled:', track.enabled, 'readyState:', track.readyState);
            });
            
            if (!newVideoState) {
                // Disable video - stop all video tracks
                console.log('🎥 ===========================================');
                console.log('🎥 === DISABLING VIDEO ===');
                console.log('🎥 ===========================================');
                console.log('🎥 Stopping all video tracks');
                videoTracks.forEach((track, index) => {
                    console.log(`🎥 Stopping track ${index}:`, track.id, 'readyState:', track.readyState);
                    if (track.readyState === 'live') {
                        // First disable the track
                        track.enabled = false;
                        console.log(`🎥 Track ${index} disabled, enabled:`, track.enabled);
                        // Then stop it completely
                        track.stop();
                        console.log(`🎥 Track ${index} stopped, new readyState:`, track.readyState);
                    } else {
                        console.log(`🎥 Track ${index} already stopped, readyState:`, track.readyState);
                    }
                });
                
                // Create new stream without video
                const audioTracks = window.localStream.getAudioTracks();
                console.log('🎥 Audio tracks to preserve:', audioTracks.length);
                audioTracks.forEach((track, index) => {
                    console.log(`🎥 Audio track ${index}:`, {
                        id: track.id,
                        enabled: track.enabled,
                        readyState: track.readyState
                    });
                });
                
                if (audioTracks.length > 0) {
                    // Keep audio, remove video
                    window.localStream = new MediaStream(audioTracks);
                    console.log('🎥 ✅ New stream created with audio only');
                } else {
                    // No audio either, create empty stream
                    window.localStream = new MediaStream();
                    console.log('🎥 ✅ New empty stream created');
                }
                
                console.log('🎥 New stream video tracks:', window.localStream.getVideoTracks().length);
                console.log('🎥 New stream audio tracks:', window.localStream.getAudioTracks().length);
                
                if (localVideoref.current) {
                    console.log('🎥 Updating video element srcObject');
                    console.log('🎥 Previous srcObject:', !!localVideoref.current.srcObject);
                    localVideoref.current.srcObject = window.localStream;
                    console.log('🎥 ✅ Video element srcObject updated');
                    console.log('🎥 New srcObject:', !!localVideoref.current.srcObject);
                    // Force video element to refresh
                    localVideoref.current.load();
                    console.log('🎥 Video element load() called');
                    // Add a small delay to ensure the video element processes the new stream
                    setTimeout(() => {
                        if (localVideoref.current) {
                            localVideoref.current.load();
                            console.log('🎥 Video element load() called after timeout');
                        }
                    }, 100);
                } else {
                    console.log('🎥 ❌ localVideoref.current is null - cannot update video element');
                }
                
                // Update all peer connections with the new stream
                console.log('🎥 Updating all peer connections with new stream');
                for (let id in connections) {
                    if (id !== socketIdRef.current) {
                        try {
                            console.log('🎥 Updating connection for user:', id);
                            
                            // Remove all existing tracks first
                            const senders = connections[id].getSenders();
                            senders.forEach(sender => {
                                console.log('🎥 Removing existing sender track:', sender.track ? sender.track.kind : 'null');
                                connections[id].removeTrack(sender);
                            });
                            
                            // Add new stream tracks (video + audio or just audio)
                            if (window.localStream.getVideoTracks().length > 0) {
                                connections[id].addTrack(window.localStream.getVideoTracks()[0], window.localStream);
                                console.log('🎥 Added video track to connection:', id);
                            } else {
                                console.log('🎥 No video tracks to add - video is disabled');
                            }
                            
                            if (window.localStream.getAudioTracks().length > 0) {
                                connections[id].addTrack(window.localStream.getAudioTracks()[0], window.localStream);
                                console.log('🎥 Added audio track to connection:', id);
                            }
                            
                            // Re-negotiate the connection
                            connections[id].createOffer().then((description) => {
                                connections[id].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                                        console.log('🎥 Sent re-negotiation offer to:', id);
                                    })
                                    .catch(e => console.log('🎥 Error setting local description:', e));
                            }).catch(e => console.log('🎥 Error creating offer:', e));
                        } catch (error) {
                            console.log('🎥 Error updating connection:', id, error);
                        }
                    }
                }
                
                console.log('🎥 ✅ VIDEO DISABLED SUCCESSFULLY - Camera hardware should be off');
            } else {
                // Re-enable video
                console.log('🎥 ===========================================');
                console.log('🎥 === RE-ENABLING VIDEO ===');
                console.log('🎥 ===========================================');
                console.log('🎥 Requesting getUserMedia with video:true, audio:', audioAvailable);
                console.log('🎥 Current window.localStream before re-enable:', !!window.localStream);
                if (window.localStream) {
                    console.log('🎥 Current stream video tracks before re-enable:', window.localStream.getVideoTracks().length);
                    console.log('🎥 Current stream audio tracks before re-enable:', window.localStream.getAudioTracks().length);
                }
                
                navigator.mediaDevices.getUserMedia({ video: true, audio: audioAvailable })
                    .then(stream => {
                        console.log('🎥 ✅ Got new video stream from getUserMedia');
                        console.log('🎥 New stream video tracks:', stream.getVideoTracks().length);
                        console.log('🎥 New stream audio tracks:', stream.getAudioTracks().length);
                        console.log('🎥 New stream active:', stream.active);
                        console.log('🎥 New stream id:', stream.id);
                        
                        const newVideoTracks = stream.getVideoTracks();
                        const existingAudioTracks = window.localStream ? window.localStream.getAudioTracks() : [];
                        
                        console.log('🎥 Existing audio tracks to merge:', existingAudioTracks.length);
                        console.log('🎥 New video tracks to add:', newVideoTracks.length);
                        
                        // Create new stream with video + existing audio
                        window.localStream = new MediaStream([...newVideoTracks, ...existingAudioTracks]);
                        
                        console.log('🎥 Final merged stream video tracks:', window.localStream.getVideoTracks().length);
                        console.log('🎥 Final merged stream audio tracks:', window.localStream.getAudioTracks().length);
                        
                        if (localVideoref.current) {
                            localVideoref.current.srcObject = window.localStream;
                            console.log('🎥 Video element srcObject updated with new stream');
                            // Force video element to refresh
                            localVideoref.current.load();
                            // Add a small delay to ensure the video element processes the new stream
                            setTimeout(() => {
                                if (localVideoref.current) {
                                    localVideoref.current.load();
                                }
                            }, 100);
                        }
                        
                        // Update all peer connections with the new stream
                        console.log('🎥 Updating all peer connections with new video stream');
                        for (let id in connections) {
                            if (id !== socketIdRef.current) {
                                try {
                                    console.log('🎥 Updating connection for user:', id);
                                    
                                    // Remove all existing tracks first
                                    const senders = connections[id].getSenders();
                                    senders.forEach(sender => {
                                        console.log('🎥 Removing existing sender track:', sender.track ? sender.track.kind : 'null');
                                        connections[id].removeTrack(sender);
                                    });
                                    
                                    // Add new stream tracks (video + audio)
                                    if (window.localStream.getVideoTracks().length > 0) {
                                        connections[id].addTrack(window.localStream.getVideoTracks()[0], window.localStream);
                                        console.log('🎥 Added new video track to connection:', id);
                                    }
                                    
                                    if (window.localStream.getAudioTracks().length > 0) {
                                        connections[id].addTrack(window.localStream.getAudioTracks()[0], window.localStream);
                                        console.log('🎥 Added audio track to connection:', id);
                                    }
                                    
                                    // Re-negotiate the connection
                                    connections[id].createOffer().then((description) => {
                                        connections[id].setLocalDescription(description)
                                            .then(() => {
                                                socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                                                console.log('🎥 Sent re-negotiation offer to:', id);
                                            })
                                            .catch(e => console.log('🎥 Error setting local description:', e));
                                    }).catch(e => console.log('🎥 Error creating offer:', e));
                                } catch (error) {
                                    console.log('🎥 Error updating connection:', id, error);
                                }
                            }
                        }
                        
                        // Stop the temporary stream
                        stream.getTracks().forEach(track => track.stop());
                        console.log('🎥 ✅ VIDEO RE-ENABLED SUCCESSFULLY');
                    })
                    .catch(error => {
                        console.log('🎥 ===========================================');
                        console.log('🎥 === ERROR RE-ENABLING VIDEO ===');
                        console.log('🎥 ===========================================');
                        console.log('🎥 ❌ ERROR re-enabling video:', error);
                        console.log('🎥 Error name:', error.name);
                        console.log('🎥 Error message:', error.message);
                        console.log('🎥 Error constraints:', error.constraint);
                        console.log('🎥 Error stack:', error.stack);
                        console.log('🎥 ===========================================');
                    });
            }
        } else {
            console.log('🎥 ❌ No localStream available for video toggle');
        }
        console.log('🎥 === END HANDLE VIDEO ===');
    }, [videoAvailable, audioAvailable, audio, video, videos.length]);

    const handleAudio = useCallback(() => {
        console.log('🎤 === HANDLE AUDIO CALLED ===');
        console.log('🎤 Current audioAvailable:', audioAvailable);
        console.log('🎤 Current videoAvailable:', videoAvailable);
        console.log('🎤 window.localStream exists:', !!window.localStream);
        if (window.localStream) {
            console.log('🎤 Current stream video tracks:', window.localStream.getVideoTracks().length);
            console.log('🎤 Current stream audio tracks:', window.localStream.getAudioTracks().length);
        }
        
        const newAudioState = !audioAvailable;
        console.log('🎤 Setting audio to:', newAudioState);
        
        // Control the actual audio track FIRST
        if (window.localStream) {
            const audioTracks = window.localStream.getAudioTracks();
            console.log('🎤 Current audio tracks to process:', audioTracks.length);
            audioTracks.forEach((track, index) => {
                console.log(`🎤 Track ${index}:`, track.id, 'enabled:', track.enabled, 'readyState:', track.readyState);
            });
            
            if (!newAudioState) {
                // Disable audio - just disable audio tracks, don't recreate stream
                console.log('🎤 DISABLING AUDIO - Disabling audio tracks only');
                audioTracks.forEach((track, index) => {
                    console.log(`🎤 Disabling track ${index}:`, track.id, 'readyState:', track.readyState);
                    // Just disable the track, don't stop it to preserve video
                    track.enabled = false;
                    console.log(`🎤 Track ${index} disabled, enabled:`, track.enabled);
                });
                console.log('🎤 ✅ AUDIO DISABLED SUCCESSFULLY');
            } else {
                // Re-enable audio - just enable existing audio tracks
                console.log('🎤 🔄 RE-ENABLING AUDIO...');
                audioTracks.forEach((track, index) => {
                    console.log(`🎤 Enabling track ${index}:`, track.id, 'readyState:', track.readyState);
                    // Re-enable the existing audio track
                    track.enabled = true;
                    console.log(`🎤 Track ${index} enabled, enabled:`, track.enabled);
                });
                console.log('🎤 ✅ AUDIO RE-ENABLED SUCCESSFULLY');
            }
        } else {
            console.log('🎤 ❌ No localStream available for audio toggle');
        }
        
        // Update states AFTER controlling the tracks
        setAudioAvailable(newAudioState);
        setAudio(newAudioState);
        console.log('🎤 States updated - audioAvailable:', newAudioState, 'audio:', newAudioState);
        console.log('🎤 === END HANDLE AUDIO ===');
    }, [audioAvailable, videoAvailable]);

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            console.log('🛑 ENDING CALL: Starting cleanup process');
            
            // Clean up all media tracks
            cleanupAllTracks();
            
            // Close socket connection if exists
            if (socketRef.current) {
                console.log('🛑 ENDING CALL: Closing socket connection');
                socketRef.current.disconnect();
            }
            
            // Close all peer connections
            if (connections && Object.keys(connections).length > 0) {
                console.log('🛑 ENDING CALL: Closing all peer connections');
                Object.values(connections).forEach(connection => {
                    if (connection && connection.close) {
                        connection.close();
                    }
                });
                // Clear the connections object
                Object.keys(connections).forEach(key => delete connections[key]);
            }
            
        } catch (error) {
            console.error('Error during call cleanup:', error);
        } finally {
            // Use React Router navigation instead of window.location.href
            console.log('🛑 ENDING CALL: Navigating to home');
            routeTo("/home");
        }
    }

    // Removed unused functions: openChat, closeChat, handleMessage




    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    const connect = useCallback((displayName) => {
        setUsername(displayName);
        setAskForUsername(false);
        getMedia();
    }, [getMedia]);

    // Memoize the video array to prevent unnecessary re-renders
    const allVideos = useMemo(() => {
        const videoArray = [];
        
        console.log('🎬 ===========================================');
        console.log('🎬 === VIDEO RENDERING ===');
        console.log('🎬 ===========================================');
        console.log('🎬 window.localStream exists:', !!window.localStream);
        console.log('🎬 window.localStream video tracks:', window.localStream ? window.localStream.getVideoTracks().length : 0);
        console.log('🎬 window.localStream audio tracks:', window.localStream ? window.localStream.getAudioTracks().length : 0);
        console.log('🎬 videos array length:', videos.length);
        console.log('🎬 videoAvailable state:', videoAvailable);
        console.log('🎬 video state:', video);
        console.log('🎬 username:', username);
        
        // Always add our own video (with or without video tracks)
        if (window.localStream) {
            videoArray.push({
                id: 'own-video',
                socketId: socketIdRef.current,
                stream: window.localStream,
                username: username || 'You',
                isOwn: true
            });
            console.log('🎬 ✅ Added own video to allVideos array (video tracks:', window.localStream.getVideoTracks().length, ')');
            console.log('🎬 videoAvailable state:', videoAvailable);
            console.log('🎬 video state:', video);
        } else {
            console.log('🎬 ❌ Not adding own video - no localStream');
        }
        
        // Add other participants
        videoArray.push(...videos);
        console.log('🎬 Total videos to render:', videoArray.length);
        console.log('🎬 ===========================================');
        
        return videoArray;
    }, [videos, videoAvailable, video, username]);

    return (
        <div>

            {askForUsername === true ? (
                <PreMeetingScreen
                    onConnect={connect}
                    localVideoRef={localVideoref}
                    videoAvailable={videoAvailable}
                    audioAvailable={audioAvailable}
                    onVideoToggle={handleVideo}
                    onAudioToggle={handleAudio}
                />
            ) : (


                <div className={styles.meetVideoContainer}>

                    {/* Share Button */}
                    <button className={styles.shareButton} onClick={handleShareMeeting}>
                        <ShareIcon />
                    </button>

                    {/* Help Button */}
                    <button className={styles.helpButton} onClick={handleHelp}>
                        <HelpIcon />
                    </button>

                    {/* Meeting Info */}
                    <div className={styles.meetingInfo}>
                        <strong>Meeting Code:</strong> {meetingCode}
                        <br />
                        <small>Share this code with others to join</small>
                    </div>

                    {/* Share Modal */}
                    <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle style={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
                            Share Meeting
                        </DialogTitle>
                        <DialogContent>
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h3 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                        Meeting Code
                                    </h3>
                                    <div style={{ 
                                        fontSize: '2.5rem', 
                                        fontWeight: 'bold', 
                                        fontFamily: 'Inter, sans-serif',
                                        letterSpacing: '0.2rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {meetingCode}
                    </div>
                                    <p style={{ fontFamily: 'Inter, sans-serif', opacity: 0.9, fontSize: '1rem' }}>
                                        Share this code with others to join your meeting
                                    </p>
                    </div>
                                <Button
                                    variant="contained"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(meetingCode);
                                        setCopySuccess(true);
                                        setTimeout(() => setCopySuccess(false), 2000);
                                    }}
                                    style={{
                                        fontFamily: 'Inter, sans-serif',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '25px',
                                        padding: '0.8rem 2rem',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    Copy Code
                                </Button>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button 
                                onClick={() => setShareModalOpen(false)}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Help Modal */}
                    <Dialog open={helpModalOpen} onClose={() => setHelpModalOpen(false)} maxWidth="md" fullWidth>
                        <DialogTitle style={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
                            How to Use ConferPoint
                        </DialogTitle>
                        <DialogContent>
                            <div style={{ padding: '1rem 0', fontFamily: 'Inter, sans-serif' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#333', marginBottom: '1rem' }}>
                                        🎥 Video Controls
                                    </h3>
                                    <ul style={{ lineHeight: '1.8', color: '#666' }}>
                                        <li><strong>Camera:</strong> Click the video icon to turn your camera on/off</li>
                                        <li><strong>Microphone:</strong> Click the mic icon to mute/unmute your audio</li>
                                        <li><strong>Screen Share:</strong> Click the screen icon to share your screen</li>
                                        <li><strong>Chat:</strong> Click the chat icon to open/close the chat panel</li>
                                    </ul>
                                </div>
                                
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#333', marginBottom: '1rem' }}>
                                        🔗 Sharing Your Meeting
                                    </h3>
                                    <ul style={{ lineHeight: '1.8', color: '#666' }}>
                                        <li>Click the <strong>Share</strong> button to get your meeting code and link</li>
                                        <li>Share the meeting code or link with others to invite them</li>
                                        <li>Others can join by entering the meeting code on the home page</li>
                                    </ul>
                    </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#333', marginBottom: '1rem' }}>
                                        💬 Chat Features
                                    </h3>
                                    <ul style={{ lineHeight: '1.8', color: '#666' }}>
                                        <li>Send messages to all participants in the chat panel</li>
                                        <li>Messages are displayed with sender names</li>
                                        <li>Chat notifications appear on the chat button</li>
                                    </ul>
                    </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#333', marginBottom: '1rem' }}>
                                        🚀 Tips for Best Experience
                                    </h3>
                                    <ul style={{ lineHeight: '1.8', color: '#666' }}>
                                        <li>Use a stable internet connection for better video quality</li>
                                        <li>Allow camera and microphone permissions when prompted</li>
                                        <li>Test your audio and video before joining important meetings</li>
                                        <li>Use headphones to avoid audio feedback</li>
                                    </ul>
                        </div>
                        </div>
                        </DialogContent>
                        <DialogActions>
                            <Button 
                                onClick={() => setHelpModalOpen(false)}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Got it!
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Copy Success Snackbar */}
                    <Snackbar 
                        open={copySuccess} 
                        autoHideDuration={3000} 
                        onClose={() => setCopySuccess(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert 
                            onClose={() => setCopySuccess(false)} 
                            severity="success" 
                            sx={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Meeting link copied to clipboard!
                        </Alert>
                    </Snackbar>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>

                            <div className= {styles.chattingHeader} >
                                <h2>In-call messages</h2>
                            </div>

                            <div className={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => {
                                    console.log(messages);
                                    return (
                                        <div className={styles.messageContainer} key={index}>
                                            <p className={styles.sender}>{item.sender}</p>
                                            <p className={styles.messageText}>{item.data}</p>
                                        </div>
                                    )
                                }) : (
                                    <div className={styles.emptyChat}>
                                        <p>No messages yet</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.chattingArea}>
                                <div className={styles.chattingMessage}>
                                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                </div>
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <div className={styles.icon}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        </div>
                        <div className={styles.icon}>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        </div>
                        <div className={styles.icon}>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        </div>
                        <div className={styles.icon}>
                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}
                        </div>
                        <div className={styles.icon}>
                        <Badge badgeContent={showModal ? 0 : newMessages} max={999} color='error'>
                            <IconButton onClick={() => {
                                setModal(!showModal);
                                if (!showModal) {
                                    setNewMessages(0); // Clear notification when opening chat
                                }
                            }} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>
                        </div>
                    </div>

                    <div className={`${styles.meetingRoom} ${showModal ? styles.chatOpen : ''}`}>
                        <div className={`${styles.conferenceView} ${
                            (videos.length > 0 || window.localStream) ? styles.hasParticipants : ''
                        } ${
                            (videos.length + (window.localStream ? 1 : 0)) === 1 ? styles.alone :
                            (videos.length + (window.localStream ? 1 : 0)) === 2 ? styles.twoParticipants :
                            (videos.length + (window.localStream ? 1 : 0)) > 2 ? styles.multipleParticipants : ''
                        }`}>
                            {allVideos.map((video) => (
                                <div key={video.id || video.socketId} className={styles.participant}>
                                    {video.stream && (video.stream.getVideoTracks().length > 0 || (video.isOwn && videoAvailable)) ? (
                                        <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                                if (ref) {
                                                    console.log('🎥 Video element ref created for:', video.username);
                                                    console.log('🎥 Video stream exists:', !!video.stream);
                                                    console.log('🎥 Video stream video tracks:', video.stream ? video.stream.getVideoTracks().length : 0);
                                                    console.log('🎥 Current srcObject:', !!ref.srcObject);
                                                    
                                                    if (video.stream && ref.srcObject !== video.stream) {
                                            ref.srcObject = video.stream;
                                                        console.log('🎥 ✅ Video element srcObject set for:', video.username);
                                                        console.log('🎥 New srcObject:', !!ref.srcObject);
                                                        
                                                        // Set muted for own video
                                                        if (video.isOwn) {
                                                            ref.muted = true;
                                                            // Set the localVideoref for own video
                                                            localVideoref.current = ref;
                                                            console.log('🎥 ✅ localVideoref.current set for own video');
                                                        }
                                                        
                                                        // Force video element to load
                                                        ref.load();
                                                        console.log('🎥 Video element load() called');
                                                        
                                                        // Check video element visibility
                                                        setTimeout(() => {
                                                            if (ref) {
                                                                const computedStyle = window.getComputedStyle(ref);
                                                                console.log('🎥 Video element visibility check:');
                                                                console.log('🎥 - display:', computedStyle.display);
                                                                console.log('🎥 - visibility:', computedStyle.visibility);
                                                                console.log('🎥 - opacity:', computedStyle.opacity);
                                                                console.log('🎥 - width:', computedStyle.width);
                                                                console.log('🎥 - height:', computedStyle.height);
                                                                console.log('🎥 - z-index:', computedStyle.zIndex);
                                                                console.log('🎥 - position:', computedStyle.position);
                                                                console.log('🎥 - videoWidth:', ref.videoWidth);
                                                                console.log('🎥 - videoHeight:', ref.videoHeight);
                                                                console.log('🎥 - readyState:', ref.readyState);
                                                                console.log('🎥 - paused:', ref.paused);
                                                                console.log('🎥 - muted:', ref.muted);
                                                                console.log('🎥 - srcObject:', !!ref.srcObject);
                                                                console.log('🎥 - parentElement:', !!ref.parentElement);
                                                                console.log('🎥 - offsetParent:', !!ref.offsetParent);
                                                                console.log('🎥 - isConnected:', ref.isConnected);
                                                                
                                                                // Try to play the video
                                                                ref.play().then(() => {
                                                                    console.log('🎥 ✅ Video play() successful');
                                                                }).catch(error => {
                                                                    console.log('🎥 ❌ Video play() failed:', error);
                                                                });
                                                            }
                                                        }, 100);
                                                    } else if (video.isOwn && !ref.srcObject && window.localStream) {
                                                        // If this is our own video and it doesn't have a stream yet, but window.localStream exists
                                                        ref.srcObject = window.localStream;
                                                        ref.muted = true;
                                                        localVideoref.current = ref;
                                                        console.log('🎥 ✅ localVideoref.current set for own video with window.localStream');
                                                        console.log('🎥 window.localStream video tracks:', window.localStream.getVideoTracks().length);
                                                        console.log('🎥 window.localStream audio tracks:', window.localStream.getAudioTracks().length);
                                                    } else if (video.isOwn && !ref.srcObject && !window.localStream) {
                                                        console.log('🎥 ❌ Own video element created but no window.localStream available yet');
                                                    } else if (video.stream) {
                                                        console.log('🎥 Video stream already assigned to element');
                                                    }
                                        }
                                    }}
                                    className={styles.participantVideo}
                                    autoPlay
                                            muted={video.isOwn}
                                            playsInline
                                            onLoadStart={(e) => {
                                                console.log('🎥 Video load started:', video.username);
                                                console.log('🎥 Video element:', e.target);
                                            }}
                                            onLoadedData={(e) => {
                                                console.log('🎥 Video data loaded:', video.username);
                                                const videoElement = e.target;
                                                console.log('🎥 Video element dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                                                console.log('🎥 Video element ready state:', videoElement.readyState);
                                            }}
                                            onLoadedMetadata={(e) => {
                                                console.log('🎥 Video metadata loaded:', video.username);
                                                const videoElement = e.target;
                                                console.log('🎥 Video metadata dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                                            }}
                                            onCanPlay={(e) => {
                                                console.log('🎥 Video can play:', video.username);
                                                const videoElement = e.target;
                                                console.log('🎥 Video element ready to play, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                                            }}
                                            onPlay={() => {
                                                console.log('🎥 Video started playing:', video.username);
                                            }}
                                            onError={(e) => {
                                                console.error('🎥 Video error:', video.username, e);
                                                console.error('🎥 Error details:', e.target.error);
                                            }}
                                        >
                                </video>
                                    ) : video.isOwn ? (
                                        // Show placeholder for own video when no video tracks
                                        <div className={styles.participantVideo} style={{
                                            backgroundColor: '#1a1a1a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#666',
                                            fontSize: '14px',
                                            border: '2px solid #333',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📹</div>
                                                <div>Camera Off</div>
                            </div>
                    </div>
                                    ) : (
                                        // Show placeholder for other participants when no video tracks
                                        <div className={styles.participantVideo} style={{
                                            backgroundColor: '#2a2a2a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#888',
                                            fontSize: '12px',
                                            border: '2px solid #444',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '20px', marginBottom: '4px' }}>👤</div>
                                                <div>No Video</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className={styles.participantLabel}>
                                        {video.username}
                                        {video.isOwn && ' (You)'}
                                    </div>
                                </div>
                        ))}
                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}
