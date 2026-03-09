"use strict";
// const authRouter = require("./lib/utils/passport");
const User = require("./lib/schema/users.schema");

const { sendResponse, errReturned } = require("./lib/utils/dto");
const { EResponseCode } = require("./lib/utils/enum");

const { HOST, PORT, SESS_SECRET, CLIENT_PORT } = require("./config/config");

const checkRole = require("./lib/middleware/permission");
const tokenValidation = require("./lib/middleware/accessToken"); // Import the token validation middleware

module.exports = (app) => {
  app.use("/api/auth", require("./api/authentication"));
  // app.use(tokenValidation);

  app.use("/api/users", require("./api/users"));
  // app.use('/api/auth/google', authRouter);
  app.use("/api/booking", require("./api/booking"));
  app.use("/api/agency", require("./api/agency"));
  // app.use("/api/roles", checkRole("admin"), require("./api/roles"));
  app.use("/api/roles", require("./api/roles"));
  app.use("/api/staff", require("./api/staff"));
  app.use("/api/flights", require("./api/amadeus"));
  app.use("/api/type", require("./api/type"));
  app.use("/api/sabre", require("./api/sabre"));
  app.use("/api/hitit", require("./api/hitit"));
  app.use("/api/permission", require("./api/permission"));
  app.use("/api/markup", require("./api/markup"));
  app.use("/api/airlineMarkup", require("./api/airlineMarkup"));
  app.use("/api/payment", require("./api/payment"));
  app.use("/api/promotion", require("./api/promotion"));
  app.use("/api/notification", require("./api/notification"));
  app.use("/api/paymentType", require("./api/paymentType"));
  app.use("/api/customer", require("./api/customer"));
  app.use("/api/visitType", require("./api/visitType"));
  app.use("/api/paxType", require("./api/paxType"));
  app.use("/api/sale", require("./api/sale"));
  app.use("/api/supplier", require("./api/supplier"));
  app.use("/api/spo", require("./api/spo"));
  app.use("/api/traveller", require("./api/traveller"));
  app.use("/api/gds", require("./api/GDS"));
  app.use("/api/book", require("./api/book"));
  app.use("/api/tourInvoice", require("./api/tourInvoice"));
  app.use("/api/customerLedger", require("./api/customerLEdger"));
  app.use("/api/Ledger", require("./api/Ledger"));
  app.use("/api/visa", require("./api/visa"));
};

