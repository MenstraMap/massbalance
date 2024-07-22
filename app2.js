const http = require("http");
const fs = require("fs");
const SerialPort = require("serialport");
const socketIo = require("socket.io");

const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://jmjkclbiybinmgvsnxgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptamtjbGJpeWJpbm1ndnNueGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMxNDUyNjAsImV4cCI6MjAyODcyMTI2MH0.ZJ62pYIZuvJJn_EBAxeLrBxPjAAjdWU-Ah4ccHMn1nw'; // Replace with your Supabase anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const index = fs.readFileSync("index.html");

const server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(index);
});

const io = socketIo(server);

const port = new SerialPort("/dev/cu.usbmodem3485187ABEC42", {
  baudRate: 57600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

port.on("error", function (err) {
  console.error("Error: ", err.message);
});

const parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: "\r\n" }));

io.on("connection", function (socket) {
  console.log("Client connected");

  socket.on("disconnect", function () {
    console.log("Client disconnected");
  });
});

parser.on("data", function (data) {
  console.log(data);
  io.emit("data", parseFloat(data));
});

const portNumber = 3002;
server.listen(portNumber, function () {
  console.log(`Server listening on port ${portNumber}`);
});
