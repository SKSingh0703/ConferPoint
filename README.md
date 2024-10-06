# ConferPoint
- Welcome to ConferPoint, a full-featured video conferencing platform designed to provide seamless communication through high-quality video calls, real-time chat, and secure authentication. Whether you are connecting with friends, colleagues, or clients, ConferPoint ensures that your virtual meetings are smooth, interactive, and efficient.

# Features
1. Video Conferencing
- ConferPoint offers crystal-clear video calls for both one-on-one meetings and group sessions. Our platform allows users to easily create and join video calls with features such as:

  - High-quality video and audio: Experience minimal lag and optimal clarity during calls.
  - Dynamic participant management: Join or leave video calls seamlessly.
  - Responsive layouts: Automatically adjusts to your device, providing an excellent experience on both desktop and mobile platforms.
2. Real-Time Chat
- Alongside video conferencing, ConferPoint provides a fully integrated chat system, allowing participants to communicate in real-time through text. Key features include:

  - Instant Messaging: Send messages instantly to all participants during the call.
  - Notification System: Get alerts for unread messages, ensuring important updates are never missed.

3. Authentication & Security
- ConferPoint prioritizes security and privacy by offering secure user authentication and protected meeting access. Our authentication features include:

  - User Registration and Login: Securely register and log in using an intuitive, easy-to-use interface.
  - JWT-based Sessions: ConferPoint uses JSON Web Tokens (JWT) to maintain session security, ensuring user data is protected.
4. WebRTC Integration
- ConferPoint leverages WebRTC (Web Real-Time Communication) technology to establish peer-to-peer connections directly between users for video and audio transmission. This ensures:

 Low latency communication: Real-time video and audio streaming without unnecessary delay.
 Direct peer connections: Minimal server interaction once the connection is established, leading to more secure and faster communication.
5. Socket.IO for Real-Time Interactions
- We use Socket.IO for handling real-time bidirectional communication, ensuring low-latency and instant chat messaging during video conferences.

6. Modern UI
- The interface is designed with Material-UI for a sleek, modern appearance and an easy-to-navigate experience. The layout is responsive and adjusts smoothly across different devices and screen sizes.

# Technologies Used
- ConferPoint is built using modern technologies to ensure performance, scalability, and security:

- Frontend:
 - React.js: Dynamic user interfaces and single-page application architecture.
 - Vite: Fast build system and development tool.
 - Socket.IO-client: Real-time chat communication.
 -  Material UI
 -  Axios
 -  CSS
- Backend:
 - Node.js: Server-side JavaScript runtime.
 - Express.js: Fast and lightweight web server.
 - WebRTC: Handles video and audio connections.
 - Socket.IO: Manages real-time communication between server and clients.
 - bcrypt: Handles password encryption for authentication.
- Authentication:
 - crypto: Provides secure and stateless authentication.
 - Database: MongoDB for storing user data securely.
 - Deployment: Hosted on Render for robust, scalable, and reliable deployment.

- Getting Started
- Prerequisites
Ensure you have the following installed:

Node.js (version 20.x or above)
npm (or yarn) for managing packages
# Installation
- Clone the repository:
git clone https://github.com/SKSingh0703/ConferPoint.git
- Navigate to the project directory:

 - cd ConferPoint
- Install the dependencies:

 - npm install
- Running the Application
- To start the development server:

 - npm run dev
- To build the application for production:

 - npm run build
- To preview the production build:

 - npm run preview
# Contributing
- We welcome contributions to improve ConferPoint! If you would like to contribute, please follow these steps:

Fork the repository.
Create a new branch for your feature.
Make the necessary changes and commit them.
Open a pull request and describe your changes.
