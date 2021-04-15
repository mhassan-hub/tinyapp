const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString, getUserIdByEmail, urlsForUserID} = require('./Helpers/helper_functions');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "hi"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "no"
  },
  "aJ48lW": {
    id: "aJ48lW", 
    email: "mhass405@gmail.com", 
    password: "as"
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
  res.send("Welcome to TinyApp V15.2.4! We are here to supply you with al your link shortening needs!");
});

/*-----------/URLS/-------------*/

app.get("/urls", (req, res) => {
  const userURL = urlsForUserID(req.cookies.users_id, urlDatabase);
  console.log(req.cookies.users_id);
  console.log('----');
  console.log(userURL);

  if (JSON.stringify(userURL) === JSON.stringify({})) {
    res.redirect('/login');
  }
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.users_id]
  };


  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  
  let shortURL = generateRandomString();


  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.users_id
  };

  res.redirect(`/urls/${shortURL}`);
});

/*-----------/URLS/NEW------------*/

app.get("/urls/new", (req, res) => {

  if (!req.cookies.users_id) {
    res.redirect("/login");
  };

  const templateVars = {user: users[req.cookies.users_id]};
  res.render("urls_new", templateVars);
});

/*-----------/URLS/LOGIN------------*/

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies.users_id]};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  // res.redirect("/login");
  let email = req.body.email;
  let password = req.body.password;

  let id = getUserIdByEmail(email, users);

  if (id && password === users[id].password) {
    res.cookie("users_id", id);
    res.redirect("/urls");
  };

  res.statusCode = 403;
  return res.send(`${res.statusCode}: please enter the correct email and password`)
});

/*-----------/URLS/LOGOUT------------*/

app.post("/logout", (req, res) => {

  res.clearCookie("users_id");

  res.redirect("/urls");
});

/*-----------/URLS/REGISTER------------*/

app.get("/register", (req, res) => {
  
  const templateVars = { user: users[req.cookies.users_id] };

  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // res.redirect(`/register`);
  let id = generateRandomString()

  let email = req.body.email;
  let password = req.body.password;

  if (email === '' || password === '') {

    res.statusCode = 400;
    return res.send(`${res.statusCode}: This email already exists`);
  };

  users[id] = {id, email, password};

  res.cookie("users_id", id);
  res.redirect(`/urls`);
});

/*-----------/URLS/SHORTURL'S------------*/

app.get("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.cookies.users_id] 
  };
  console.log(urlDatabase[req.params.shortURL].longURL);
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