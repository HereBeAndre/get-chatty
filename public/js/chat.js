// NOTE: Allows client to connect to WebSocket on server
const socket = io();

// START ~ DOM elements
const messageFormElement = document.getElementById("message-form");
const messageInputElement = messageFormElement.querySelector("input");
const messageButtonElement = messageFormElement.querySelector("button");
const sendLocationButtonElement = document.getElementById(
  "send-location-button"
);
// END ~ DOM elements

// START ~ Templates
const messagesElement = document.getElementById("messages");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
// END ~ Templates

// START ~ Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// END ~ Options

// START ~ const and helpers
const TIME_FORMAT = "h:mm a";
const formatDate = (date, format = TIME_FORMAT) => moment(date).format(format);
// END ~ const and helpers

socket.on("message", (message) => {
  const { text, createdAt } = message;
  const htmlMessageElement = Mustache.render(messageTemplate, {
    msg: text,
    createdAt: formatDate(createdAt),
  });
  messagesElement.insertAdjacentHTML("beforeend", htmlMessageElement);
});

socket.on("locationMessage", (message) => {
  const { text: locationUrl, createdAt } = message;
  const htmlLocationElement = Mustache.render(locationTemplate, {
    locationUrl,
    createdAt: formatDate(createdAt),
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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
