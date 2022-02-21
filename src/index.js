const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const {
  geoLocationRequestBuilder,
  generateMessage,
} = require("./utils/functions");
const Filter = require("bad-words");

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
  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Watch your mouth! Profanity is not welcome here.");
    }
    io.emit("message", generateMessage(message));
    callback(); // Ackwoledgement
  });

  socket.on("sendLocation", (coordinates, callback) => {
    io.emit(
      "locationMessage",
      generateMessage(geoLocationRequestBuilder(coordinates))
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
