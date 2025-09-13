
import { Server } from "socket.io"
import { Meeting } from "../models/meeting.model.js"


let connections = {}
let messages = {}
let timeOnline = {}
let userNames = {} // Store usernames by socket ID

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (data) => {
            console.log('🔌 ===========================================');
            console.log('🔌 === USER JOINING CALL ===');
            console.log('🔌 ===========================================');
            console.log('🔌 Socket ID:', socket.id);
            console.log('🔌 Data received:', data);
            console.log('🔌 Data type:', typeof data);
            
            // Handle both old format (just path) and new format (object with path and username)
            let path, username;
            if (typeof data === 'string') {
                path = data;
                username = `User ${socket.id.slice(0, 5)}`; // Default fallback
                console.log('🔌 Using old format - path:', path, 'username:', username);
            } else {
                path = data.path;
                username = data.username || `User ${socket.id.slice(0, 5)}`;
                console.log('🔌 Using new format - path:', path, 'username:', username);
            }

            if (connections[path] === undefined) {
                connections[path] = []
                console.log('🔌 Created new room:', path);
            }
            connections[path].push(socket.id)
            console.log('🔌 Added user to room. Total users in room:', connections[path].length);
            console.log('🔌 Room users:', connections[path]);

            timeOnline[socket.id] = new Date();
            userNames[socket.id] = username; // Store username
            console.log('🔌 Stored username:', username, 'for socket:', socket.id);

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })

            for (let a = 0; a < connections[path].length; a++) {
                console.log('🔌 Emitting user-joined to:', connections[path][a], 'new user:', socket.id);
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path], username)
            }
            
            // Send existing usernames to the new user
            const existingUsers = connections[path].filter(id => id !== socket.id);
            if (existingUsers.length > 0) {
                const existingUsernames = existingUsers.map(id => ({ socketId: id, username: userNames[id] }));
                io.to(socket.id).emit("existing-users", existingUsernames);
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })

        socket.on("signal", (toId, message) => {
            console.log('🔌 ===========================================');
            console.log('🔌 === SIGNAL RECEIVED ===');
            console.log('🔌 ===========================================');
            console.log('🔌 From socket:', socket.id);
            console.log('🔌 To socket:', toId);
            console.log('🔌 Message type:', typeof message);
            console.log('🔌 Message length:', message ? message.length : 0);
            
            try {
                const parsedMessage = JSON.parse(message);
                console.log('🔌 Parsed message:', parsedMessage);
                if (parsedMessage.sdp) {
                    console.log('🔌 SDP type:', parsedMessage.sdp.type);
                }
                if (parsedMessage.ice) {
                    console.log('🔌 ICE candidate:', !!parsedMessage.ice);
                }
            } catch (e) {
                console.log('🔌 Could not parse message:', e.message);
            }
            
            io.to(toId).emit("signal", socket.id, message);
            console.log('🔌 ✅ Signal forwarded to:', toId);
            console.log('🔌 ===========================================');
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("disconnect", async () => {
            console.log('🔌 ===========================================');
            console.log('🔌 === USER DISCONNECTED ===');
            console.log('🔌 ===========================================');
            console.log('🔌 Socket ID:', socket.id);
            console.log('🔌 Username:', userNames[socket.id]);

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            console.log('🔌 Time online:', diffTime, 'ms');

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k
                        console.log('🔌 Found user in room:', key);

                        for (let a = 0; a < connections[key].length; ++a) {
                            console.log('🔌 Emitting user-left to:', connections[key][a]);
                            io.to(connections[key][a]).emit('user-left', socket.id, userNames[socket.id])
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)
                        console.log('🔌 Removed user from room. Remaining users:', connections[key].length);
                        
                        // Clean up username
                        delete userNames[socket.id]
                        console.log('🔌 Cleaned up username for socket:', socket.id);


                        if (connections[key].length === 0) {
                            delete connections[key]
                            // Also delete messages for this room
                            if (messages[key]) {
                                delete messages[key]
                            }
                            
                            // Delete meeting from database when room becomes empty
                            try {
                                await Meeting.findOneAndDelete({ meetingCode: key });
                                console.log(`Meeting ${key} deleted from database - room is empty`);
                            } catch (error) {
                                console.log(`Error deleting meeting ${key} from database:`, error);
                            }
                        }
                    }
                }

            }


        })


    })


    return io;
}
