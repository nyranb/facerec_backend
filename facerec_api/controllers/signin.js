const handleSignIn = (req,res, db, bcrypt) => {
    const { email, password } = req.body
    if(!email || !password) {
        return res.status(400).json("Field blank");
    }
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
};

module.exports = {
    handleSignIn,
}
