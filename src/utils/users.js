const users = [];

const addUser = (user) => {
  let { id, username, room } = user;

  // Sanitize
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate
  if (!username || !room) return { error: "Username and room are required!" };

  // Check for existing user
  const isUserAlreadyExisting = users.find(
    (user) => user.room === room && user.username === username
  );

  // Validate username
  if (isUserAlreadyExisting) return { error: "Username already in use!" };

  const newUser = { id, username, room };
  users.push(newUser);
  return { newUser };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
