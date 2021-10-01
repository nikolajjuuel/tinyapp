const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { application } = require("express");

const cookieSession = require('cookie-session')
//const cookieParser = require('cookie-parser')


const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//app.use(cookieParser())

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


function generateRandomString() {
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const urlShort = [];
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * options.length + 1);
    urlShort.push(options[random])
  }
  return urlShort.join('');
}

const users = {
  "1": {
    id: "1",
    email: "nikolaj.juuel@gmail.com",
    password: "123"
  },
  "232": {
    id: "232",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


const urlDatabase = {
  "b2xVn2": {
    longURL: "https://www.tsn.ca",
    userID: "1"
  },
  "hsm5xK": {
    longURL: "https://www.google.ca",
    userID: "1"
  },
  "asadsa": {
    longURL: "https://www.lifford.ca",
    userID: "1"
  },
  "dsads": {
    longURL: "https://www.matrix.ca",
    userID: "2"
  }
};


const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return null
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //const id = req.cookies["user_id"];
  const id = req.session.username;

  if (id === undefined) {
    res.redirect('/login');
  }

  const email = users[id].email;
  const templateVars = {
    urls: urlDatabase,
    user_id: email,
    id:id
  };

  console.log('templateVars',templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
 // const id = req.cookies["user_id"];
  const id = req.session.username;
  //console.log('id2',id2);
  console.log('id',id);

  if (id === undefined) {
    res.redirect('/login');
  }
  const email = users[id].email;
  //email logined as 
  const templateVars = { user_id: email }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //const id = req.cookies["user_id"];
  const id = req.session.username;
  const email = users[id].email;
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL, longURL: urlDatabase[shortURL], user_id: email,
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const inputUrl = req.body.longURL;
  //const id = req.cookies["user_id"];
  const id = req.session.username;

  const randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: inputUrl,
    userID: id,
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${randomString}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const object = req.body;
  shortURL = Object.keys(object);
  console.log(req.body);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
})

app.get("/login", (req, res) => {
  const templateVars = { user_id : req.session.username
}
  email = req.params.email;
  console.log('params', req.params);

  res.render("login", templateVars);
})


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  const user = findUserByEmail(email);
  console.log(user);
  if (!user) {
    return res.status(400).send('no user with that email was found');
  }

  if(!bcrypt.compareSync(password, user.password)){
    return res.status(400).send('password does not match')
  } 

  //res.cookie('user_id', user.id);
  req.session.username = user.id;

  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  const user_id = (req.body.name);
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[shortURL], user_id: req.session.username

  };
  res.render("register", templateVars);
})


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res.status(400).send("email or password cannot be blank");
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('user with that email currently exists')
  }

  const user_id = generateRandomString();

  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  }

  console.log(users);
  //res.cookie('user_id', user_id);
  req.session.username = user_id;
  res.redirect(`/urls`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

