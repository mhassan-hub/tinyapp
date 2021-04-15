const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

const getUserIdByEmail = function (email, users) {
  for (let id in users) {
    if (email === users[id].email) {
      return id;
    }
  }
};

const urlsForUserID = function (user_ID, urlDatabase) {
  const result = {};
  // const id = getUserIdByEmail(email, users);

  for (const url in urlDatabase) {
    console.log(urlDatabase[url].userID);
    if (urlDatabase[url].userID === user_ID) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

module.exports = {
  generateRandomString,
  getUserIdByEmail,
  urlsForUserID
};