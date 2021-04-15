const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {generateRandomString, getUserIdByEmail, urlsForUserID} = require('./helpers');

const app = express();
const PORT = 8080;
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['users_id']
}));

app.set("view engine", "ejs");
//change emails to shorter for testing
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

app.get("/", (req, res) => {
  if (!req.session.users_id) {
    res.redirect("/login");
  };
  res.redirect('/urls');
  res.send("Welcome to TinyApp V15.2.4! We are here to supply you with al your link shortening needs!");
});

app.get("/error", (req, res) => {
  const templateVars = {user: users[req.session.users_id]};

  res.render('urls_error', templateVars);
});

app.post("/error", (req, res) => {
  const templateVars = {user: users[req.session.users_id]};

  res.redirect('/register')
});

/*-----------/URLS/-------------*/
app.get("/urls", (req, res) => {
  const userURL = urlsForUserID(req.session.users_id, urlDatabase);
  const templateVars = { 
    urls: userURL, 
    user: users[req.session.users_id]
  };

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.users_id
  };
  res.redirect(`/urls/${shortURL}`);
});

/*-----------/URLS/NEW------------*/
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.users_id]};

  if (!req.session.users_id) {
    res.redirect("/login");
  };
  res.render("urls_new", templateVars);
});

/*-----------/URLS/LOGIN------------*/
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.users_id]};

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserIdByEmail(email, users);

  if (id && bcrypt.compareSync(password, users[id].password)) {
    req.session.users_id = id;
    res.redirect("/urls");
    return;
  };
  res.statusCode = 403;
  return res.send(`${res.statusCode}: please enter the correct email and password`)
});

/*-----------/LOGOUT------------*/
app.post("/logout", (req, res) => {
  req.session.users_id = null;
  res.redirect("/urls");
});

/*-----------/REGISTER------------*/
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.users_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: One of the fields required is empty`);
  };
  users[id] = {
    id, 
    email, 
    password: bcrypt.hashSync(password, saltRounds)
  };
  req.session.users_id = id;
  res.redirect(`/urls`);
});

/*-----------/URLS/SHORTURL'S------------*/
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.session.users_id] 
  };

  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => { 
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

/*-------------/URLS/SHORTURL/DELETE-------------*/
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

/*-----------LISTENING TO PORT 8080------------*/
app.listen(PORT, () => {
  console.log(`TinyApp V15.2.4 is listening on port ${PORT}!`);
});