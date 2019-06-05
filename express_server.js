const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`urls/${randomURL}`);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars)

})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase}
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}


