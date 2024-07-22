const express = require("express");
const http = require("http");
const { createClient } = require("@supabase/supabase-js");
const socketIo = require("socket.io");

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/sensor-data", async (req, res) => {
  const { data } = req.body;
  console.log(`Received data: ${data}`);

  // Insert data into Supabase
  const { error } = await supabase.from("sensor_data").insert([{ data }]);

  if (error) {
    console.error("Error inserting data:", error.message);
    res.status(500).send("Error inserting data");
    return;
  }

  // Broadcast data to connected clients
  io.emit("data", data);
  res.status(200).send("Data received");
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Real-time subscription setup
const subscription = supabase
  .from("sensor_data")
  .on("*", (payload) => {
    console.log("Change received!", payload);
    io.emit("data", payload.new.data);
  })
  .subscribe();

const port = process.env.PORT || 3002;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
