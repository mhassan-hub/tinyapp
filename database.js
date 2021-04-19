const bcrypt = require('bcrypt');

const saltRounds = 10;

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "a@a.com", 
    password: bcrypt.hashSync('aa', saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "abed@community.com", 
    password: bcrypt.hashSync("no", saltRounds)
  },
  "aJ48lW": {
    id: "aJ48lW", 
    email: "troy@community.com", 
    password: bcrypt.hashSync("as", saltRounds)
  }
};

const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: "aJ48lW"
  },
  "9sm5xK": { 
    longURL: "http://www.google.com", 
    userID: "aJ48lW"
  }
};

module.exports = {
  users,
  urlDatabase
};