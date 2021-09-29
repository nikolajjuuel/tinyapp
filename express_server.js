const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { application } = require("express");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())


function generateRandomString() {
  const options ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const urlShort = [];
    for (let i = 0; i < 6; i++){
      const random = Math.floor(Math.random() * options.length + 1);
      urlShort.push(options[random])
    }
   return urlShort.join('');
  }

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "hsm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    const templateVars = { 
      urls: urlDatabase,
      username: req.cookies["username"],
     };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL]};
    console.log(templateVars);
    res.render("urls_show", templateVars);
  });

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/u/:shortURL", (req, res) => {
    //console.log(res);
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  });

  app.post("/urls", (req, res) => {
    // console.log(req.body);  // Log the POST request body to the console
     const inputUrl = req.body.longURL;
     const randomString = generateRandomString();
     urlDatabase[randomString] = inputUrl;
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

   app.post("/urls/:shortURL/", (req, res)=>{
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
  })

  app.post("/login", (req, res)=>{
    const username = (req.body.name);
    console.log(req.params);
    res.cookie('username', username);
    res.redirect("/urls");
  })

  app.post("/logout", (req, res)=>{
    const username = (req.body.name);
    res.clearCookie('username', username);
    res.redirect("/urls");
  })
  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

