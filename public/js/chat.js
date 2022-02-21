// NOTE: Allows client to connect to WebSocket on server
const socket = io();

// START ~ DOM elements
const messageFormElement = document.getElementById("message-form");
const messageInputElement = messageFormElement.querySelector("input");
const messageButtonElement = messageFormElement.querySelector("button");
const sendLocationButtonElement = document.getElementById(
  "send-location-button"
);
const sidebarElement = document.getElementById("sidebar");
// END ~ DOM elements

// START ~ Templates
const messagesElement = document.getElementById("messages");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const usersTemplate = document.getElementById("sidebar-template").innerHTML;
// END ~ Templates

// START ~ Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// END ~ Options

// START ~ const and helpers
const TIME_FORMAT = "h:mm a";
const formatDate = (date, format = TIME_FORMAT) => moment(date).format(format);

const autoScroll = () => {
  const newMessageElement = messagesElement.lastElementChild;

  // Get height of new message
  const newMessageStyles = getComputedStyle(newMessageElement);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessageElement.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messagesElement.offsetHeight;

  // Height of messages container
  const containerHeight = messagesElement.scrollHeight;

  // Get current scroll position
  const scrollOffset = messagesElement.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }
};
// END ~ const and helpers

// START ~ socket listeners
socket.on("message", (message) => {
  const { username, text, createdAt } = message;
  const htmlMessageElement = Mustache.render(messageTemplate, {
    username,
    msg: text,
    createdAt: formatDate(createdAt),
  });
  messagesElement.insertAdjacentHTML("beforeend", htmlMessageElement);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const { text, createdAt, username } = message;
  const htmlLocationElement = Mustache.render(locationTemplate, {
    locationUrl: text,
    createdAt: formatDate(createdAt),
    username,
  });
  messagesElement.insertAdjacentHTML("beforeend", htmlLocationElement);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const htmlUsersElement = Mustache.render(usersTemplate, {
    room,
    users,
  });
  sidebarElement.innerHTML = htmlUsersElement;
});
// END ~ socket listeners

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

// Error handling on Join page
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
