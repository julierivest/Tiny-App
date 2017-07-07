//LIBRARIES & ASSOCIATED STUFF----------------
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["nbrtueilwiur2903PQWDIFGP8"],
  maxAge: 24 * 60 * 60 * 1000
}));


//ORIGINAL OBJECTS--------------------

const urlDatabase = {
  "JulieR": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

const users = {
  "JulieR": {
    id: "JulieR",
    email: "julier@gmail.com",
    password: "juliepswd"
  },
  "ValR": {
    id: "ValR",
    email: "valr@hotmail.com",
    password: "valpswd"
  }
};

const globalDatabase = {};

//FUNCTIONS----------------------------

//FUNC THAT GENERATES A RANDOM STR OF 6 CHARACS - USED FOR SHORT-URLS & USER-IDS
function generateRandomString() {
  var randStr = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randStr;
}

//FUNC THAT CHECKS IF AN EMAIL PASSED TO IT EXISTS IN THE USERS OBJECT
//returns true if it is
//returns false if it's not
function emailExist(email) {
  for (let userKey in users) {
    //console.log(users[userKey].email);
    if (users[userKey].email === email) {
      return true;
    }
  }
  return false;
}

//FUNC THAT RETURNS THE USERKEY FROM THE USERS ARRAY THAT HAS A CERTAIN EMAIL
function userForExistingEmail(email) {
  for (let userKey in users) {
    if (users[userKey].email === email) {
      return users[userKey];
    }
  }
}

function urlsForUser(id) {
  return urlDatabase[id];
}

//ROUTES-----------------------

//POST + /URLS
app.post("/urls", (req, res) => {
  //checking if userid is in URLdatabase
  //if it is, add url pair as value to userIDKey
  let shortURL = generateRandomString();
  for (let userIDKey in urlDatabase) {
    if (req.session.user_id === userIDKey) {
      urlDatabase[userIDKey][shortURL] = req.body.longURL;
    }
  }
  //console.log(urlDatabase);
  //redirects to urls_show
  res.redirect("/urls/" + shortURL);
  //console.log(urlDatabase);
});

//GET + /LOGIN
app.get("/login", (req, res) => {
  let templateVars = {
     URLs: urlDatabase,
     user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  res.render("registrationForm")
});



//HERE!!!!!!!!!
app.post("/login", (req, res) => {
  if (!emailExist(req.body.email)) {
    res.status(403);
    res.send('Email does not exist!');
  }
  else if (!bcrypt.compareSync(req.body.password, userForExistingEmail(req.body.email).password)) {
    //console.log(userForExistingEmail(req.body.email).password, req.body.password);
    //console.log((bcrypt.compareSync(userForExistingEmail(req.body.email).password, req.body.password)));
    res.status(403);
    res.send('Password does not exist!');
  }
  else {
    req.session.user_id = userForExistingEmail(req.body.email).id;
    //res.cookie('user_id', userForExistingEmail(req.body.email).id);
    res.redirect('/urls');
  }
});



app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Cannot submit empty field');
  } else if (emailExist(req.body.email)) {
    res.status(400);
    res.send('Email already registered');
  }
  //add random string as userID for user registers
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  urlDatabase[userID] = {}
  req.session.user_id = userID;
  res.redirect('/urls');
});


//when user logs out, returns to /urls
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  else {
    res.redirect("urls");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    URLs: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    URLs: urlDatabase,
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/urls");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[req.session.user_id][shortURL];
  //console.log(urlDatabase);
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.session.user_id][req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//if anyone not logged in who has an existing short URL enters it in /u/shortURL, they'll be redirected to long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = "";
  for (let userIDKey in urlDatabase) {
    if (urlDatabase[userIDKey][shortURL]) {
      longURL = urlDatabase[userIDKey][shortURL];
    }
  }
  if (longURL) {
    res.redirect(longURL);
  }
  else {
    res.send("Not a valid short URL");
  }
});

//if enter /urls/shortURL that is valid and that belongs to user who is logged in --> show the page of long URL
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[req.session.user_id] && urlDatabase[req.session.user_id][shortURL]) {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.session.user_id][shortURL],
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("You do not have access to this link")
  }
});

//confirms in console if server is started
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





