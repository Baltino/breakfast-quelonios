const UsersTable = require('./UsersTable')

class Users {

  constructor (mailer) {
    this.db = new UsersTable()
    this.mailer = mailer
  }

  add (user) {
    return new Promise((resolve, reject) => {
      this.db.getUserByEmail(user.email)
        .then(oldUser => {
          if(!oldUser) {
            return this.db.addUser(user)
          }else {
            return { error: false, ...oldUser }
          }
        })
        .then(res => {
          if(res.error) {
            reject(res)
          }else {
            resolve(res)
          }
        });
    });
  }

  getAll () {
    return new Promise((resolve, reject) => {
      this.db.getUsers()
        .then(users => resolve(users))
        .catch(err => reject({ error: err }))
    })
  }

  justBrought(user) {
    return new Promise((resolve, reject) => {
      this.db.updateLastBring(user)
        .then(res => resolve(res))
        .catch(err => reject({ error: err }))
    })
  }

}

module.exports = Users
