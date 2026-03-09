// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// const express = require("express");
// const googleAuth = require("../../api/authentication/google-auth.dal");
// const router = express.Router();
// const { OAuth2Client } = require("google-auth-library");
// const { EResponseCode } = require("./enum");
// const { sendResponse } = require("./dto");
// const jwt = require("jsonwebtoken");

// require("dotenv").config();

// const client = new OAuth2Client(passport_oth);
// let userProfile;

// passport.serializeUser(function (user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//   done(null, user);
// });

// passport.use(
//   new GoogleStrategy(
//     {
//     },
//     function (accessToken, refreshToken, profile, done) {
//       userProfile = profile;
//       return done(null, userProfile);
//     }
//   )
// );

// // request at /auth/google, when user click sign-up with google button transferring
// // the request to google server, to show emails screen
// router.get(
//   "/",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get("/success", (req, res) => {
//   if (req.user) {
//     res.status(200).json({
//       success: true,
//       message: "successfull",
//       user: req.user,
//       //   cookies: req.cookies
//     });
//   }
// });

// // URL Must be same as 'Authorized redirect URIs' field of OAuth client, i.e: /auth/google/callback
// router.get(
//   "/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/api/auth/google/error",
//   }),
//   (req, res) => {
//     res.redirect("/api/auth/google/success"); // Successful authentication, redirect success.
//   }
// );

// router.post("/success", async (req, res) => {
//   const data = await verifyGoogleToken(req.body.credential, req.body.clientId);

//   const { failure, response } = await googleAuth.registerWithGoogle(data);
//   if (failure) console.log("Google user already exist in DB..");
//   else console.log("Registering new Google user..");

//   const token = jwt.sign(response, process.env.TOKEN_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

//   res.header("auth-token", token).json({ token, user: response });
// });

// router.get("/error", (req, res) => res.send("Error logging in via Google.."));

// router.get("/signout", (req, res) => {
//   try {
//     req.session.destroy(function (err) {});
//     res.render("auth");
//   } catch (err) {
//     res.status(400).send({ message: "Failed to sign out user" });
//   }
// });

// async function verifyGoogleToken(token, clientId) {
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: clientId,
//     });
//     return { payload: ticket.getPayload() };
//   } catch (error) {
//     return { error: "Invalid user detected. Please try again" };
//   }
// }

// module.exports = router;
