const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080;

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/register", (req, res) =>{
  newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password}
  res.cookie("user_id", users[id]);


  res.redirect("/urls")
})


app.post("/urls/new", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

app.post("/urls/login", (req, res) => {
  const name = req.body.username;
  res.cookie("username", name);
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]}
  templateVars.longURL = req.body.longURL;
  urlDatabase[templateVars.shortURL] = req.body.longURL
  res.render("urls_show", templateVars)
})

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]}
  res.render("urls_register", templateVars)
})



app.get("/urls/logout", (req, res) => {
  const username = req.cookies["username"]
  res.clearCookie("username", username);
  res.redirect("/urls")
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]}
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}






