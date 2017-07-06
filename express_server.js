const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "JulieR": {
    id: "JulieR",
    email: "julier@gmail.com",
    password: "juliepswd"
  },
  "ValR": {
    id: "ValR",
    email: "valr2@hotmail.com",
    password: "valpswd"
  }
};


app.get("/register", (req, res) => {
  res.render("registrationForm")
});

app.post("/register", (req, res) => {
 let userID = generateRandomString();
 users[userID] = {
  id: userID,
  email: req.body.email,
  password: req.body.password
  }
  console.log(users);
  res.cookie(userID);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
 let shortURL = generateRandomString();
 urlDatabase[shortURL] = req.body.longURL;
 res.redirect("/urls/" + shortURL);
});



app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  console.log(res.cookies);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  console.log(req.cookies);
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    URLs: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.get("/urls/:id", (req, res) => {
  //console.log(req.params.id);
  let shortURL = req.params.id;
  let templateVars =
  {
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  var randStr = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randStr;
}
