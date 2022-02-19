const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const { geoLocationRequestBuilder } = require("./utils/functions");

const port = process.env.PORT || 3000;

const app = express();

/* NOTE: express does it under the hood. In this case, we need to configure it 
in order to serve it to socket.io - which accepts the core `http` module */
const server = http.createServer(app);

// NOTE: Setup WebSocket on server-side - client -> server connection is set inside chat.js file
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// NOTE: socket is an object containing information about the connection
io.on("connection", (socket) => {
  socket.emit("message", "Welcome to the server!");
  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (message) => {
    io.emit("message", message);
  });

  socket.on("sendLocation", (coordinates) => {
    io.emit("message", geoLocationRequestBuilder(coordinates));
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
