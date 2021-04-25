const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const User = require("../UserModel");
const Movie = require("../MovieModel");
const express = require('express');
// const faker = require('faker'); 
let router = express.Router();


router.get("/", displayAll);
router.post("/", express.json(), createUser);  //would be for registering users (when register button is clicked) also update their session data!

router.put("/:uid/Updatefollowing", updateFollowing);
router.put("/Profile/updateStatus", contributeStatus);
router.put("/Profile/Notifications", express.json(), updateNotifs);
router.get("/:uid", recommendedMovies, sendSingleUser);


router.put("/:uid", express.json(), saveUser); 

// router.get("/:uid/followedPeople");


//Look into router.params

router.param("uid", function(req, res, next, value){
	let oid;
	// console.log(value);




	console.log("Finding user by ID: " + value);
	if(value=="Profile"){
		// console.log(req.session);
		if(!req.session.loggedin){
			console.log("not logged in");
			res.status(401).redirect("../../Login")
			return;
		  }
	  
		// console.log(req.session.username);
		User.findByUsername(req.session.username, function(err, result){
			if(err){
				console.log("Error querying movies.")
				res.status(500).send("Error with query.");
				return;
			}
			if(!result){
				
				res.status(404).render('partials/errors', {ErrorCode: "user " + value + " does not exist.", link:""}); 
        		return;
			
			}
			req.user = result;
			console.log(result.UsersFollowed);
			if(result.UsersFollowed.includes(req.params.uid)){
				console.log("following")
			}
			// req.user = result;
			req.btnState=false;
			req.btnState = result.UsersFollowed.includes(req.params.uid);

		
			next();
		});
	}
	else{	
		if(req.session.loggedin){
			User.findById(req.session._id,function(err,result){
				console.log(result.UsersFollowed);
				if(result.UsersFollowed.includes(req.params.uid)){
					console.log("following")
				}
				// req.user = result;
				req.btnState=false;
				req.btnState = result.UsersFollowed.includes(req.params.uid);

			})
		  }
		try{
			oid = new ObjectId(value); //assigns the value Id to oid
		}catch(err){
			res.status(404).render('partials/errors', {ErrorCode: "user " + value + " does not exist.", link:""}); 
			return;
		}
	//Also populate the reviews
	User.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}
		if(!result){
			res.status(404).render('partials/errors', {ErrorCode: "user " + value + " does not exist.", link:""}); 
			return;
		}

 		req.user = result;
		
	
 		next();
	})}
});


function contributeStatus(req, res, next){

	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login");
		return;
	}
	
	User.findById(req.session._id, function(err, user){
		if (err) throw err;
		
		user.Contributer = !user.Contributer;

		user.save(function(err, result){
			if(err){
				console.log(err);
				res.status(500).send("Error updating UsersFollowed.");
				return;
			}
			console.log("Successfully Update UsersFollowed");
			// res.status(201).send(JSON.stringify(newUser));
			// res.status(201).send("Successfully Updated UsersFollowed!")  //or redirect to the main page 
			res.status(200).redirect(req.get('referer'));
		})
	})
}

function updateNotifs(req, res, next){
	console.log(req.body.notif);
	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login")
		return;
	}

	// console.log(req);
	console.log(req.session._id);
	User.findById(req.session._id, function(err, result){
		console.log(result.Notifications);
		console.log(result.Notifications.includes(req.body.notif))
		result.Notifications.pull(req.body.notif);
		console.log(result.Notifications);
		result.save(function(err, result){
			if(err){
				console.log(err);
				res.status(500).send("Error updating user.");
				return;
		}
		// res.status(200).send(JSON.stringify(result));
		res.status(201).redirect(req.get('referer'));
	})
})

}

function updateFollowing(req, res, next){
	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login");
		return;
	}
	
	let uid = req.params.uid;
	
	//checks to ensure the user cannot follow themselves
	if((uid === "Profile") || (uid === req.session._id)){
		console.log("you cannot follow yourself");
		res.status(403).send("You cannot follow yourself");
		return;
	}

	User.findById(req.session._id, function(err, user){
		if (err) throw err;
		// console.log(user);
		
		//should probably check to ensure we are not already following the person 
		if(user.UsersFollowed.includes(uid)){
			console.log("Removing "+uid+" from UsersFollowed!");
			user.UsersFollowed.pull(uid);
		
			User.findById(uid, function(err, u){
				u.FollowedBy.pull(req.session._id);
				u.save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error updating PeopleFollowed.");
						return;
					}})
			})
		}else{
			console.log("Adding "+uid+" to UsersFollowed");
			user.UsersFollowed.push(uid);
			//Get uid object and update their notification 
			User.findById(uid, function(err, targetUser){
				let str = user.Username + "has followed you!"
				targetUser.Notifications.push(str);
				targetUser.FollowedBy.push(req.session._id)
				targetUser.save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error sending notification.");
						return;
					}
					console.log("Successfully sent notification");
					// res.status(201).send(JSON.stringify(newUser));
					// res.status(201).send("Successfully Updated UsersFollowed!")  //or redirect to the main page 
				})
			})
			
		}

		user.save(function(err, result){
			if(err){
				console.log(err);
				res.status(500).send("Error updating UsersFollowed.");
				return;
			}
			console.log("Successfully Update UsersFollowed");
			// res.status(201).send(JSON.stringify(newUser));
			res.status(200).send("Successfully Updated UsersFollowed!")  //or redirect to the main page 
		})
	})
}


function displayAll(req, res, next){
	User.find({}, function(err, users) {
		// console.log(users);
		res.render('../views/displayAllUsers', {users: users});
	 });
}



function saveUser(req, res, next){
	console.log(req.body);
	console.log(req.params.uid);

	delete req.body._id;
	req.user = Object.assign(req.user, req.body);
	req.user.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error updating user.");
			return;
		}
		res.status(200).send(JSON.stringify(result));

	});
}




//Creates a new user
function createUser(req, res, next){
	let newUser = new User();
	//checks if there is already a user object with the same .username value make it CASE INSENSITIVE 
	//look into .nin()
	let uname = new RegExp(`^${req.body.username}$`, "i");
	User.findOne({Username: uname}, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}
		
		if(result){ //if the username is already taken 
			//alert("User "+req.body.username+" exists.");
			res.status(400).send("user " + value + " exists."); //Change this 
			return;
			
		}
		console.log("username validation passed!");
	//Initalize state of new user
	newUser._id = mongoose.Types.ObjectId();
	newUser.Username = req.body.username;
	newUser.Password = req.body.password;
	newUser.Contributer = false;
	newUser.PeopleFollowed = [];
	newUser.UsersFollowed = [];
	newUser.Reviews = [];
	newUser.WatchList = [];
	newUser.Recommended = [];
	newUser.Notifications = [];
	newUser.FollowedBy = [];
	console.log(newUser);
	//save new user
	newUser.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error creating user.");
			return;
		}
		console.log("user created");
		req.session.username = req.body.username;
		req.session._id = newUser._id;
		req.session.loggedin = true;
		res.session = req.session;
		// res.status(201).send(JSON.stringify(newUser));
		res.status(201).render("../views/userProfile", {user: newUser})  //or redirect to the main page 
	})
	});	
	
}

function recommendedMovies(req, res, next){
	console.log("recommendedMovies");
	if(!(req.user._id == req.session._id)){
		console.log(req.user.id+ "  -- "+req.session._id)
		next();
	}
	// console.log(req.user);
	// req.sim = "Hi"; //<--- this is how you send the recommended movies 
	let s = [];
	let mids = [];
	if(req.user.Watchlist.length > 0){
		
		req.user.populate("Watchlist", function(err, movie){
			for(let i = 0; i < movie.Watchlist.length; i++){
				for(let j = 0; j < movie.Watchlist[i].Genre.length; j++){
					if(!s.includes(movie.Watchlist[i].Genre[j])){
						s.push(movie.Watchlist[i].Genre[j])
					}
			
				}	
				mids.push(req.user.Watchlist[i]._id);
			}
		
		// console.log(s);
		// console.log(mids);
		// console.log(req.user.Watchlist);
		Movie.findMoviesBasic(s, mids, function(err, result){
			// console.log(result);
			res = [];
			let random = result.sort(() => .5 - Math.random()).slice(0,5)
			for(index in random){
				res.push(random[index]._id)
			}
			req.sim = res;
			next();
		})
		});
		
	}else{
		console.log("no watchlist")
		s = new RegExp(' ', 'i');
		// Movie.findMoviesBasic(s, function(err, result){
		Movie.find().limit(25).exec(function(err,result){
			// console.log(result);
			res = [];
			let random = result.sort(() => .5 - Math.random()).slice(0,5)
			for(index in random){
				res.push(random[index]._id)
			}
			req.sim = res;
			next();
		})
	
		
	}


}




function sendSingleUser(req, res, next){
	console.log(req.btnState);

	// recommendedMovies();
	// console.log(req.sim);
	req.user.Recommended = req.sim;
	req.user.populate("PeopleFollowed UsersFollowed Watchlist Recommended Reviews", function(err, result){ //also populate recommended

	// console.log(result)
	//Put an if conditional abt whether the userProfile should be rendered or the logged in Profile
	if(req.user._id == req.session._id){
		// console.log("Send profile!");
	res.format({
		"application/json": function(){
			res.status(200).json(result);
		},
		"text/html": () => { res.render("../views/userProfile", {user: result}); }
		});
		
	}else{
		console.log("send users page");
		res.format({
			"application/json": function(){
				res.status(200).json(result);
			},
			"text/html": () => { res.render("../views/user", {user: result, logged: req.btnState}); }
			});
	}


	next();	});
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;


