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
  let result = false;
  for(user in users){
    if(email === users[user].email){
      result = true;
    }
  }
  return result;
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/register", (req, res) =>{
  let email = req.body.email;
  if(!email){
     res.status(404);
     res.redirect("/urls/register")
  }
  if(email && emailLookup(email) === true){
    res.status(404);
    res.redirect("/urls/register")
  } else if (email && emailLookup(email) === false){
    const newId = generateRandomString();
     users[newId] = {
       id: newId,
       email: email,
       password: req.body.password
     }
     console.log(users)
     res.cookie("user_id", newId);
     res.redirect("/urls")
  }

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
  const user = req.cookies["user_id"];
  res.cookie("user_id", user);
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
   if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars)
})

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase}
      if(req.cookies["user_id"]){
    templateVars.user = users[req.cookies["user_id"]]
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






