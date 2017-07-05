var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { URLs: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
 let shortURL = generateRandomString();
 urlDatabase[shortURL] = req.body.longURL;
 res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  //urlDatabase = { shortURL: req.body.longURL};
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
    //name: "raph",
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});


function generateRandomString() {
  var randStr = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randStr;
}
