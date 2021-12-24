const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = knex ({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : '',
      password : '',
      database : 'facerec'
    }
  });

app.get('/', (req, res) => {res.send("Success")})
app.post('/signin', (req, res) => signin.handleSignIn(req,res, db, bcrypt));
app.post('/register', (req, res) => register.handleRegister(req,res, db, bcrypt));
app.get('/profile/:id', (req, res) => profile.handleProfileGet(req,res, db));
app.put('/image', (req, res) => image.handleImage(req,res, db));
app.post('/imageurl', (req, res) => image.handleAPICall(req,res));


app.listen(3000, () => {
    console.log("app has started ");
});