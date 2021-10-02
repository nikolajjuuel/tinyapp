const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { application } = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const users = {
  "FGwMh": {
    id: "FGwMh",
    email: "example@example.com",
    password: "$2a$10$NPagxjAAghelEYDAf6crteHHzGZF3ipJCT2VxHqrkU9ISGafhUwdi"
  },
  "lw3uLE": {
    id: "lw3uLE",
    email: "nikolaj.juuel@gmail.com",
    password: "$2a$10$5gWQUZokhX1jvYaBlW3EOetqkSB6NobVOdtcnWJJx6/V/ubkXKoyi"
  }
}


const urlDatabase = {
  "b2xVn2": {
    longURL: "https://www.facebook.com/",
    userID: "lw3uLE"
  },
  "hsm5xK": {
    longURL: "https://www.champ-sys.ca/",
    userID: "lw3uLE"
  },
  "asadsa": {
    longURL: "https://www.innovadiscs.com/",
    userID: "lw3uLE"
  },
  "dsads": {
    longURL: "https://www.matrix.ca",
    userID: "FGwMh"
  }
};


app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
// if no session cookie prompts user to login
  const id = req.session.username;
  if (id === undefined) {
    return res.status(401).send("Please Login to view page");
  }

// sets username === email address
  const email = users[id].email;
  const templateVars = {
    urls: urlDatabase,
    user_id: email,
    id: id
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.username;
  if (id === undefined) {
    res.redirect('/login');
  }

  const email = users[id].email;
  const templateVars = { user_id: email }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.username;
  if (users[id] === undefined) {
    return res.status(401).send("Unauthorized");
  }

  const email = users[id].email;
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL, longURL: urlDatabase[shortURL], user_id: email,
  };

  if (urlDatabase[shortURL] === undefined) {
    return res.status(400).send("Bad Request");
  }

  //checks if user has access to the URL's
  const owner = urlDatabase[shortURL].userID;
  if (id !== owner) {
    return res.status(401).send("Unauthorized");

  }

  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  //Directs short URL to long URL destination
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  //creates new short URL with unique ID 
  const inputUrl = req.body.longURL;
  const id = req.session.username;

  const randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: inputUrl,
    userID: id,
  };

  res.redirect(`/urls/${randomString}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const object = req.body;
  shortURL = Object.keys(object);
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.post("/urls/:shortURL/", (req, res) => {
  //edit existing short URL to a new destination
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls');
})

app.get("/login", (req, res) => {
  const id = req.session.username;
  if (id !== undefined) {
    res.redirect('/urls');
  }
  const templateVars = {
    user_id: req.session.username
  }
  res.render("login", templateVars);
})


app.post("/login", (req, res) => {
  //authenticates user on login
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(400).send('no user with that email was found');
  }

  //compares password to hashed password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send('password does not match')
  }
  //adds encrypted login cookie
  req.session.username = user.id;

  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[shortURL], user_id: req.session.username
  };

  if (req.session.username) {
    res.redirect('/urls');
  }

  res.render("register", templateVars);
})


app.post("/register", (req, res) => {
    //user creation and password hashing 
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send('user with that email currently exists')
  }

  const user_id = generateRandomString();

  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  }

  req.session.username = user_id;
  res.redirect(`/urls`)
})


app.get('*', function (req, res) {
  return res.status(404).send('page not found')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

