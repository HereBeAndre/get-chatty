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
const { CHAT_BOT } = require("./utils/constants");

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
  const { id: socketId } = socket;

  socket.on("join", (userInfo, callback) => {
    const { error, newUser } = addUser({ id: socketId, ...userInfo });

    if (error) {
      return callback(error);
    }

    const { username: sanitizedUserName, room: sanitizedRoomName } = newUser;

    // .join() can be used only server-side - it allows to access a specific chat room
    socket.join(sanitizedRoomName);
    socket.emit(
      "message",
      generateMessage(
        CHAT_BOT,
        `Hey ${sanitizedUserName}! Welcome to ${sanitizedRoomName}!`
      )
    );
    socket.broadcast
      .to(sanitizedRoomName)
      .emit(
        "message",
        generateMessage(
          CHAT_BOT,
          `${sanitizedUserName} has just joined ${sanitizedRoomName}!`
        )
      );

    io.to(sanitizedRoomName).emit("roomData", {
      room: sanitizedRoomName,
      users: getUsersInRoom(sanitizedRoomName),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Watch your mouth! Profanity is not welcome here.");
    }

    const { room, username } = getUser(socketId);
    io.to(room).emit("message", generateMessage(username, message));

    callback(); // Ackwoledgement
  });

  socket.on("sendLocation", (coordinates, callback) => {
    const { room, username } = getUser(socketId);
    io.to(room).emit(
      "locationMessage",
      generateMessage(username, geoLocationRequestBuilder(coordinates))
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socketId);
    if (user)
      io.to(user.room).emit(
        "message",
        generateMessage(CHAT_BOT, `${user.username} has left!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
