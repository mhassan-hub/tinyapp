const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// not functional this is just to print urlDatabase
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//not functional
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.users_id]
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.users_id]};
  res.render("urls_new", templateVars);
});

const getId = function (email, users) {
  for (let key in users) {
    if (email === users[key].email) {
      return key;
    }
  }
}

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password;

  res.cookie("user_id", getId(email, users));
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("users_id")
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  
  const templateVars = { user: users[req.cookies.users_id] };

  console.log(templateVars);
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  let id = generateRandomString()
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("users_id", id);
  // urlDatabase[shortURL] = req.body.longURL;
  console.log(users);
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL], 
    user: users[req.cookies.users_id] 
  };
  res.render('urls_show', templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];

  console.log(urlDatabase);
  res.redirect(`/urls/`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});