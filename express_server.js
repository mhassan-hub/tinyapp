/*-------------REQUIRES---------------*/
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {generateRandomString, getUserIdByEmail, urlsForUserID} = require('./helpers');

/*-------------CONSTANTS---------------*/
const app = express();
const PORT = 8080;
const saltRounds = 10;

/*-------------APP SETUP---------------*/
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['users_id']
}));

app.set("view engine", "ejs");

/*-------------TESTING DATABASE---------------*/
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

/*-------------/ROOT---------------*/
app.get("/", (req, res) => {
  if (!req.session.users_id) {
    return res.redirect("/login");
  };
  res.redirect('/urls');
});

/*-----------/ERROR/-------------*/
app.get("/error", (req, res) => {
  const templateVars = {
    error: 'Error status 403: Please Register or Login to access this feature or URL! ',
    user: users[req.session.users_id]
  };
  res.render('urls_error', templateVars);
});

app.get("/error/400", (req, res) => {
  const templateVars = {
    error: 'Error status 400: Please fill out both the email and password fields',
    user: users[req.session.users_id]
  };
  res.render('urls_error', templateVars);
});

app.get("/error/404", (req, res) => {
  const templateVars = {
    error: 'Error status 404: This page you are trying to accesss does not exist!',
    user: users[req.session.users_id]
  };
  res.render('urls_error', templateVars);
});

app.get("/error/login", (req, res) => {
  const templateVars = {
    error: 'Error status 403: The email and password you entered are incorrect!',
    user: users[req.session.users_id]
  };
  res.render('urls_error', templateVars);
});

/*-----------/URLS/-------------*/
app.get("/urls", (req, res) => {
  let templateVars =  {};

  // Login check - If the user is logged in send information, if not send error 
  if (req.session.users_id) {

    // Checking for 
    const userURL = urlsForUserID(req.session.users_id, urlDatabase);
    templateVars = { 
      urls: userURL, 
      user: users[req.session.users_id]
    };
  } else {
    templateVars = {user: users[req.session.users_id]};
    return res.redirect('/error')
  }

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

  // Login check
  if (!req.session.users_id) {
    return res.redirect("/login");
  };
  const templateVars = {user: users[req.session.users_id]};
  res.render("urls_new", templateVars);
});

/*-----------/URLS/LOGIN------------*/
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.users_id]};

  // Login check
  if (req.session.users_id) {
    return res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Returns User id if email matches our database
  const id = getUserIdByEmail(email, users);

  // If id exists and if passwords match login user
  if (id && bcrypt.compareSync(password, users[id].password)) {
    req.session.users_id = id;
    return res.redirect("/urls");
  };
  res.redirect('/error/login');
});

/*-----------/LOGOUT------------*/
app.post("/logout", (req, res) => {

  // deleting session cookie and unknown session.sig cookie
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect("/urls");
});

/*-----------/REGISTER------------*/
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.users_id] };

  //Login check
  if (req.session.users_id) {
    return res.redirect('/urls');
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.redirect('/error/400')
  };
  users[id] = {
    id, 
    email, 
    password: bcrypt.hashSync(password, saltRounds)
  };
  req.session.users_id = id;
  res.redirect(`/urls`);
});

/*-----------/URLS/SHORTURL------------*/
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[req.session.users_id] 
  };

  // Login check
  if (!req.session.users_id) {
    return res.redirect('/error');
  };

  // Checking if shortURL is part of urlDatabase obj
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.redirect('/error/404'); 
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;

  // Checking if shortURL is part of urlDatabase obj
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.redirect('/error/404'); 
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect('/urls');
});

/*-------------/URLS/SHORTURL/DELETE-------------*/
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

/*-----------LISTENING TO PORT 8080------------*/
app.listen(PORT, () => {
  console.log(`TinyApp V15.2.4 is listening on port ${PORT}!`);
});