// NOTE: Allows client to connect to WebSocket on server
const socket = io();

const messageForm = document.getElementById("message-form");

socket.on("message", (message) => {
  console.log(message);
});

messageForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const message = evt.target.elements.message.value;

  socket.emit("sendMessage", message);
});
