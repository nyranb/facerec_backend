function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const handleRegister = (req,res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if(!name || !email || !password) {
        return res.status(400).json("Field blank");
    }
    const hash = bcrypt.hashSync(password);
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
                    name: capitalizeFirstLetter(name),
                    joined: new Date()
                }).then(user => {
                    res.json(user[0])
                })
            })
            .then(trx.commit)
            .then(trx.rollback)
        })
        .catch(err => res.status(400).json(err))
            
}

module.exports = {
    handleRegister
}