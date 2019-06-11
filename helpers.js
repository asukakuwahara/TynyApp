//create random string for user id and short URLs
module.exports = {

generateRandomString: function() {
  return Math.random().toString(36).substring(2, 8);
},

emailLookup: function(email, users){
  for (user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
},

urlsForUser: function(id, data){
  for (url in data) {
    if (id === data[url].userID) {
      return data[url].longURL;
    }
  }
}

};
