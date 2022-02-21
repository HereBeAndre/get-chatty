const express = require("express");
const http = require("http");
const path = require("path");

const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  geoLocationRequestBuilder,
  generateMessage,
} = require("./utils/functions");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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
  socket.on("join", (userInfo, callback) => {
    const {
      error,
      newUser: { username: sanitizedUserName, room: sanitizedRoomName },
    } = addUser({ id: socket.id, ...userInfo });

    if (error) {
      return callback(error);
    }

    // .join() can be used only server-side - it allows to access a specific chat room
    socket.join(sanitizedRoomName);
    socket.emit(
      "message",
      generateMessage(
        `Hey ${sanitizedUserName}! Welcome to ${sanitizedRoomName}!`
      )
    );
    socket.broadcast
      .to(sanitizedRoomName)
      .emit(
        "message",
        generateMessage(
          `${sanitizedUserName} has just joined ${sanitizedRoomName}!`
        )
      );

    callback();
  });

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
    const user = removeUser(socket.id);
    if (user)
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
