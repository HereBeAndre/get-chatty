// NOTE: Allows client to connect to WebSocket on server
const socket = io();

// START ~ DOM elements
const messageFormElement = document.getElementById("message-form");
const messageInputElement = messageFormElement.querySelector("input");
const messageButtonElement = messageFormElement.querySelector("button");
const sendLocationButtonElement = document.getElementById(
  "send-location-button"
);
const messagesElement = document.getElementById("messages");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
// END ~ DOM elements

socket.on("message", (message) => {
  console.log(message);
  const htmlMessageElement = Mustache.render(messageTemplate, {
    msg: message,
  });
  messagesElement.insertAdjacentHTML("beforeend", htmlMessageElement);
});

socket.on("locationMessage", (locationUrl) => {
  const htmlLocationElement = Mustache.render(locationTemplate, {
    locationUrl,
  });
  messagesElement.insertAdjacentHTML("beforeend", htmlLocationElement);
});

// START ~ Event listeners
messageFormElement.addEventListener("submit", (e) => {
  e.preventDefault();
  // Disable form until message is sent
  messageButtonElement.setAttribute("disabled", "disabled");

  const {
    target: {
      elements: {
        message: { value: msg },
      },
    },
  } = e;

  socket.emit("sendMessage", msg, (error) => {
    // Enable form after message is sent
    messageButtonElement.removeAttribute("disabled");
    messageInputElement.value = "";
    messageInputElement.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

sendLocationButtonElement.addEventListener("click", (e) => {
  e.preventDefault();
  const { geolocation } = navigator;

  if (!geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  sendLocationButtonElement.setAttribute("disabled", "disabled");

  geolocation.getCurrentPosition((position) => {
    const {
      coords: { latitude, longitude },
    } = position;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      sendLocationButtonElement.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});
// END ~ Event listeners
