function getRGBValue() {
  return Math.floor(Math.random() * 256);
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function getUsersRGB(io, id) {

  const clients = io.sockets.adapter.rooms.get(id);

  if (clients) {
    
    const users = [];
  
    for (const clientId of clients ) {
      const clientSocket = io.sockets.sockets.get(clientId);

      users.push({ 
        id: clientId, 
        nickname: clientSocket.nickname, 
        score: clientSocket.score,
      });
    }

    io.sockets.in(id).emit('send-users-rgb', users);
  } 
}

module.exports = function (socket, io) { 

  let red;
  let green;
  let blue;

  socket.on("get-users-rgb", id => {
    getUsersRGB(io, id)
  })

  socket.on("join-game", id => {
    socket.score = 0;
    socket.join(id);
  })

  socket.on("leave-game", id => {
    socket.leave(id);
  })

  socket.on("get-rgb-colors", (difficulty = 6) => {
    red = getRGBValue();
    green = getRGBValue();
    blue = getRGBValue();

    const colors = [];

    for (let i = 0; i < difficulty; i++) {
      colors.push({ red: getRGBValue(), green: getRGBValue(), blue: getRGBValue()})
    }

    colors[getRandomNumber(difficulty)] = { red, green, blue };

    socket.emit("send-rgb", { red, green, blue });
    socket.emit("send-colors", colors);
  });

  socket.on("send-answer", (answer, id) => {
    if (answer.red == red && answer.green == green && answer.blue == blue) {
      socket.score++;
      socket.emit("get-answer", true)
      getUsersRGB(io, id)
    } else {
      socket.score--;
      socket.emit("get-answer", false)
      getUsersRGB(io, id)
    }
  })
}