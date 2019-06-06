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

const getUserById = function (user_id) {
  return users[user_id];
}

const emailLookup = function (email){
  for(user in users){
    if(email === users[user].email){
      return user;
    }
  }
}

let urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

app.post("/urls/register", (req, res) =>{
  let email = req.body.email;
  if(!email){
     res.status(404).send('type something at least');
  }
  if(email && emailLookup(email)){
    res.status(404).send('email already registered');
  } else if (email && !emailLookup(email)){
    const newId = generateRandomString();
     users[newId] = {
       id: newId,
       email: email,
       password: req.body.password
     }
     res.cookie("user_id", newId);
     res.redirect("/urls")
  }
})

app.post("/urls/new", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = {longURL: req.body["longURL"], userID: req.cookies["user_id"]};
  res.redirect(`/urls/${randomURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

app.post("/urls/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  if (!email){
     res.status(404);
     res.redirect("/urls/login")
  }
  if (email && !emailLookup(email)){
    res.status(403).send('email does not match any account');
  }
  if (email && emailLookup(email) && password !== users[emailLookup(email)].password){
     res.status(403).send('incorrect password');
  }
  if (email && emailLookup(email) && password === users[emailLookup(email)].password){
     res.cookie( "user_id", emailLookup(email));
     res.redirect("/urls")
  }
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  }
   if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars)
})

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  }
  if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
  } else {
    templateVars.user = "";
  }
  res.render("urls_index", templateVars)
})

app.get("/urls/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  }
  if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
  } else {
    templateVars.user = "";
  }
  res.render("urls_register", templateVars)
})

app.get("/urls/logout", (req, res) => {
  const user_id = req.cookies["user_id"]
  res.clearCookie("user_id", user_id);
  res.redirect("/urls")
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
  }
    if (req.cookies["user_id"]) {
    templateVars.user = users[req.cookies["user_id"]]
  } else {
    templateVars.user = "";
  }
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login_page", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]}
    if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
  }
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






