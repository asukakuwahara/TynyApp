const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const bcrypt = require('bcrypt');
const cookieSession  = require('cookie-session');

// Helper functions
var helpers = require('./helpers.js');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'user_id',
  keys: ['secretkey'],
}))

app.set("view engine", "ejs");

//databases for users and urlDatabase
const users = {}
const urlDatabase = {};

//post endpoints

//register page sets cookie to a successful user
app.post("/urls/register", (req, res) =>{
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  if (!email || !password) {
     res.status(404).send('type something at least');
  }
  if (email && helpers.emailLookup(email, users)) {
    res.status(404).send('email already registered');
  } else if (email && !helpers.emailLookup(email, users)){
    const newId = helpers.generateRandomString();
    users[newId] = {
      id: newId,
      email: email,
      password: hashedPassword
    }
  req.session.user_id = newId;
  res.clearCookie("error", req.cookies.error);
  res.redirect("/urls");
  }
})

app.post("/urls/new", (req, res) => {
  const randomURL = helpers.generateRandomString();
  urlDatabase[randomURL] = {longURL: req.body["longURL"], userID: req.session.user_id};
  res.redirect(`/urls/${randomURL}`);
});

//stops non-owners from deleting URLs in the middleware
app.use("/urls/:shortURL/delete", function(req, res, next){
  if (!helpers.urlsForUser(req.session.user_id, urlDatabase)){
    res.status(404).send('Login to gain access');
  }
  next();
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

//gives cookie with encrypted password to only successful users
app.post("/urls/login", (req, res) => {
  const typedpassword = req.body.password;
  const email = req.body.email;
  if (!email){
    res.status(403).send('Type something at least!');
  }
  if (email && !helpers.emailLookup(email, users)){
    res.status(403).send('email does not match any account');
  }
  if (email && helpers.emailLookup(email, users) && !bcrypt.compareSync(typedpassword, users[helpers.emailLookup(email, users)].password)){
    res.status(403).send('incorrect password');
  }
  if (email && helpers.emailLookup(email, users) && bcrypt.compareSync(typedpassword, users[helpers.emailLookup(email, users)].password)){
    res.clearCookie("error", req.cookies.error);
    req.session.user_id = helpers.emailLookup(email, users);
    res.redirect("/urls");
  }
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body["longURL"]
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    error: ""
  }
  res.render("urls_show", templateVars);
})

//GET endpoints

app.get("/", (req, res) => {
  res.redirect("/urls/login");
})

//empty user/error key needed for ejs
app.get("/urls/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: "",
    error: ""
  }
  if(req.session.user_id) {
    templateVars.user = users[req.session.user_id];
  }
  res.render("urls_register", templateVars)
})

app.get("/urls/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    error: req.cookies.error
  }
  res.render("login_page", templateVars);
});

app.get("/urls/logout", (req, res) => {
  const user_id = req.session.user_id;
  res.clearCookie("user_id", user_id);
  res.clearCookie("user_id.sig", user_id);
  res.redirect("/urls");
})


//users without cookie will be redirected to login page with error cookie
app.use("/urls", function(req, res, next){
  if (!req.session.user_id) {
    res.cookie("error", "403");
    res.redirect("/urls/login");
  }
  next()
})

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    error: req.cookies.error
  }
    res.render("urls_index", templateVars);
})


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: "",
    error: ""
  }
  if (req.session.user_id) {
    templateVars.user = users[req.session.user_id];
  }
  res.render("urls_new", templateVars);
});

app.use("/urls/:shortURL", function(req, res, next){
  if (!helpers.urlsForUser(req.session.user_id, urlDatabase)) {
    res.status(404).send('Login to gain access');
  }
  next()
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    error: ""
    }
      res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})





