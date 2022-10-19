var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require("./routes/testAPI");
var unitsRouter = require("./routes/units");

var app = express();
const cors = require('cors')

var corsOptions = {
  origin: 'http://localhost:3005'
}

//Allow cors from selected clients
app.use(cors(corsOptions))

//parse request of content type application/json
app.use(express.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/units", unitsRouter);
app.use("/testAPI", testAPIRouter);
require("./routes/events.router")(app);
require("./routes/locations.router")(app);
require("./routes/units.router")(app);
require("./routes/default_event_topics.router")(app);
require("./routes/event_units.router")(app);
require("./routes/testing_typess.router")(app);
require("./routes/states.router")(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const grafana_db = require("./models");
grafana_db.seq.sync()
  .then(() => {
    console.log("Synced grafana_db.");
  })
  .catch((err) => {
    console.log("Failed to sync grafana_db: " + err.message);
  });


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
