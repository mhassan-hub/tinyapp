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
    username: req.cookies["username"] 
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
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});

app.get("/register", (req, res) => {
  
  const templateVars = {
    email: req.body.email,
    password: req.body.password, 
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL], 
    username: req.cookies["username"] 
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