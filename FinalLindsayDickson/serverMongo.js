const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");
const User = require("./UserModel");
const Person = require("./PeopleModel");
const Movie = require("./MovieModel");
const app = express()
app.set('view engine', 'pug');

const pug = require('pug');

const fs = require("fs");
const path = require("path");


app.use(session({ secret: 'some secret key here',
                  resave: false,
                  saveUninitialized: false
                })
);

app.use(express.urlencoded({extended: true}));


//Routers 
let userRouter = require("./routers/userRouter");
app.use("/users", userRouter);
let movieRouter = require("./routers/movieRouter");
app.use("/movies", movieRouter);
let personRouter = require("./routers/personRouter");
app.use("/people", personRouter);
let reviewRouter = require("./routers/reviewsRouter");
app.use("/reviews", reviewRouter);



app.post("/Login", login);
app.get("/logout", logout);

app.get('/', (req, res) =>{
	// response.redirect('/Login');
	res.status(200).render('index');
})

app.get('/Login', (req, res) =>{
    res.status(200).render('LoginRegister');
})

app.get('/Contribute', (req, res) =>{
    if(!req.session.loggedin){
      console.log("not logged in");
      res.status(401).redirect("../../Login")
      return;
    }
    User.findById(req.session._id, function(err, user){
      if(err){
        console.log("Error reading user.")
        res.status(500).send("Error reading user.");
        return;
      }
      if(!user.Contributer){
        console.log("Not a contributing user!")
        res.status(403).render('partials/errors', {ErrorCode: "Not a contributing user!", link: ''}); 
        return;
      }
  
    res.status(200).render("contribute");  })
})

app.get('/Search', (req, res, next) =>{

  Movie.genres(function(err, result){

    res.format({
      "application/json": function(){
        res.status(200).json(result);
      },
      "text/html": () => { res.status(200).render("search", {genres: result}); }
    })
  })
})




/* Functions */

function login(req, res, next){
  console.log(req.session)
	if(req.session.loggedin){
		res.status(200).send("Already logged in."); 
		return;
	}

	let username = req.body.username;
	let password = req.body.password;

  console.log("Logging in with credentials:");
  // console.log(req.body);
  console.log("Username: " + req.body.username);
  console.log("Password: " + req.body.password);
  User.findOne({Username: req.body.username}, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}
		
		if(!result){ 
			res.status(404).send("User not found."); 
			return;
		}

  if(result.Password === password){
    req.session.loggedin = true; 
    req.session.username = username;
    req.session._id = result._id;
    res.session = req.session;
    res.status(200).redirect("../users/Profile") //should prob render the profile 
  }else{
    res.status(401).send("Not authorized. Invalid password.");
  }
  next();
});
}


function logout(req, res, next){
	if(req.session.loggedin){
		req.session.loggedin = false;
    req.session.username = undefined;
    req.session._id = undefined;
		res.status(200).render('LoginRegister');
	}else{
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

mongoose.connect('mongodb://localhost/movieDb', {useNewUrlParser: true});

//Get the default Mongoose connection (can then be shared across multiple files)
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  //We're connected
  console.log("Connected to someDatabaseName database.");
  
  //We could execute other commands in here
  //We could also just start our server
  
    app.use(express.static(path.join(__dirname, 'public'))); //inputs css & js

    app.listen(3000);
    console.log("Server listening at http://localhost:3000");


});
