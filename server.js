const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
const ObjectID = require('mongodb').ObjectID;
const conn = mongoose.connection;
const schema = new mongoose.Schema({username: 'string', _id: 'string', exercises: 'object'});
const User = mongoose.model('User', schema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', function(req, res) {
  if (!req.body.username) {
    res.send("Path username is required.");
    return;
  }
  let user = {username: req.body.username, _id: new ObjectID()};
  conn.collection('users').insert(user);
  res.json(user);
});

app.post('/api/exercise/add', function(req, res) {
  if (!req.body.userId) {
    res.send("Path userId required");
    return;
  }
  User.findOne({_id: req.body.userId}, function(err, user) {
    if (err) {
      res.send(err);
      return;
    }
    user.exercises = user.exercises || [];
    let date = new Date(req.boy.date);
    user.exercises.append({description: req.body.description, date: date, duration: req.body.duraction});
    user.save(function(err, user) {
      if (err) {
        res.send
      let data = {username: user.username, _id: user._id, description: req.body.description, date: date, duration: req.body.duration};
      res.json(data);
    });
  });
});

app.get('/api/exercise/log', function(req, res) {
  if (!req.query.userId) {
    res.send("Path userId required");
    return;
  }
  User.findOne({_id: req.query.userId}, function(err, user) {
    if (err) {
      res.send(err);
      return;
    }
    let log = user.exercises || [];
    if (req.query.from) log = log.filter(x => x.date >= req.query.from);
    if (req.query.to) log = log.filter(x => x.date >= req.query.to);
    if (req.query.limit) log = log.slice(0, req.query.limit);
    log.forEach(x => x.date = new Date(x).toString());
    let data = {username: user.username, _id: user._id};
    res.json(user);
  });
});

app.get('/api/exercise/users', function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      res.send(err);
      return;
    }
    res.json(users);
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
