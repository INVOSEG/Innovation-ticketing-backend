const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory array to hold connected users
let Users = [];

// Function to add a user
const updateCash = (walletAddress, socketId) => {
  if (!Users.some((user) => user.walletAddress === walletAddress)) {
    Users.push({ walletAddress, socketId });
  }
};

// Function to remove a user by socketId
const RemoveUser = (socketId) => {
  Users = Users.filter((user) => user.socketId !== socketId);
};

// Function to find a user by walletAddress
const FindUser = (walletAddress) => {
  const user = Users.find((user) => user.walletAddress === walletAddress);
  return user;
};

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle "AddUser" event to add a user to the Users array
  socket.on("AddUser", (Data) => {
    console.log("AddUser event received:", Data);
    AddUser(Data.walletAddress, socket.id);
    console.log("User list:", Users);
  });

  // Handle "disconnect" event to remove the user when they disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
    RemoveUser(socket.id);
  });

  // Handle "sendNotification" event to send notifications to a specific user
  socket.on("sendNotification", async (body) => {
    console.log("SendNotification event received:", body);
    const user = FindUser(body.walletAddress[0]);
    const data = {
      msg: "Notification received from the socket.io",
      status: body.status,
    };
    if (user?.socketId) {
      io.to(user.socketId).emit("RecieveNotification", data);
    }
  });
});

// Set up the Express server
app.get("/", (req, res) => {
  res.send("Socket.io server running");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
