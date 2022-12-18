const express = require("express");
// const path = require("path"); removed
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const debug = require("debug");
// added for cors
const cors = require("cors");
const csurf = require("csurf");
const { isProduction } = require("./config/keys");

// const indexRouter = require("./routes/index"); removed
const usersRouter = require("./routes/api/users"); // update the import file path
const tweetsRouter = require("./routes/api/tweets");
const csrfRouter = require("./routes/api/csrf");

const app = express();

app.use(logger("dev")); // log request components (URL/method) to terminal
app.use(express.json()); // parse JSON request body
app.use(express.urlencoded({ extended: false })); // parse urlencoded request body
app.use(cookieParser()); // parse cookies as an object on req.cookies
// app.use(express.static(path.join(__dirname, "public"))); // serve the static files in the public folder removed

if (!isProduction) {
  // Enable CORS only in development because React will be on the React
  // development server (http://localhost:3000). (In production, the Express
  // server will serve the React files statically.)
  app.use(cors());
}

// Set the _csrf token and create req.csrfToken method to generate a hashed
// CSRF token
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

// Attach Express routers
// app.use("/", indexRouter); removed
app.use("/api/users", usersRouter); // update the path
app.use("/api/tweets", tweetsRouter);
app.use("/api/csrf", csrfRouter);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.statusCode = 404;
  next(err);
});

const serverErrorLogger = debug("backend:error");

// Express custom error handler that will be called whenever a route handler or
// middleware throws an error or invokes the `next` function with a truthy value
app.use((err, req, res, next) => {
  serverErrorLogger(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    statusCode,
    errors: err.errors,
  });
});

module.exports = app;
