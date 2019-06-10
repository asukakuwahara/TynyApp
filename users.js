var express = require('express')
var router = express.Router()

router.post(function timeLog (req, res, next) {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  if (!email || !password) {
     res.status(404).send('type something at least');
  }
  if (email && emailLookup(email)) {
    res.status(404).send('email already registered');
  } else if (email && !emailLookup(email)){
    const newId = generateRandomString();
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

module.exports = router