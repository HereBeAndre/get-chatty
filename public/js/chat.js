// NOTE: Allows client to connect to WebSocket on server
const socket = io();

const messageForm = document.getElementById("message-form");
const sendLocationButton = document.getElementById("send-location-button");

socket.on("message", (message) => {
  console.log(message);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message);
});

sendLocationButton.addEventListener("click", (e) => {
  e.preventDefault();

  const { geolocation } = navigator;
  if (!geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  geolocation.getCurrentPosition((position) => {
    const {
      coords: { latitude, longitude },
    } = position;
    socket.emit("sendLocation", { latitude, longitude });
  });
});
