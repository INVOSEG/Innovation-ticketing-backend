const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const http = require("http");
let server = http.createServer(app);

require("dotenv").config();

const { HOST, PORT, SESS_SECRET } = require("./config/config");
const { dbConnection } = require("./lib/utils/connection.js");
const { SABRE } = require("./config/config.js");

const Booking = require("./lib/schema/booking.schema.js");

const MAX_AGE = 1000 * 60 * 60 * 3; // Three hours

app.use(
  session({
    secret: SESS_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: MAX_AGE },
    resave: false,
  })
);

dbConnection()
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.log("error in connection", err);
  });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(morgan("dev"));
app.use(helmet());
const CLIENT_URL = process.env.CLIENT_URL;
const sabre = process.env.SABRE;
const allowedOrigins = [CLIENT_URL, sabre];

// Configure CORS options
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Content-Type, Authorization, auth-token, sessionid, sessiondate",
  credentials: false,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server is Running..");
});

require("./routes")(app);

server.listen(PORT, () =>
  console.log(`Server started on http://${HOST}:${PORT}`)
);
