const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sam',
            email: 'sam@gmail.com',
            password: 'apples',
            entries: 0,
            joined: new Date()
        }
    ],

    login: [
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.send("Success");
})

app.post('/signin', (req,res) => {
    const { email, password } = req.body
    db.select('email', 'hash').from('logins')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash); 
            if(isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => {
                        res.json(user[0])
                    })
                .catch(err => res.status(400).json("Unable to retrieve user."))
            } else {
                res.status(400).json("Wrong email or password")
            }
        })
        .catch(err => res.status(400).json("Wrong email or password"))
})

app.post('/register', (req,res) => {
    const { email, name, password } = req.body;
    var hash = bcrypt.hashSync(password);
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('logins')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                }).then(user => {
                    res.json(user[0])
                })
            })
            .then(trx.commit)
            .then(trx.rollback)
        })
        .catch(err => res.status(400).json(err))
            
    })


app.get('/profile/:id', (req,res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
        .then(user => {
            if(user.length) {
                res.json(user[0])
            } else {
                res.json("User not found.")
            }
        })
        .catch(err => {
            res.status(400).json("profile not found")
        })
})

app.put('/image', (req,res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => {
        res.status(400).json("Error")
    })

    // if(!found) {
    //     res.status(400).json("profile not found")
    // }
})

app.listen(3000, () => {
    console.log("app has started ");
});