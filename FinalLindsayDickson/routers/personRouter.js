const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("../PeopleModel");
const Movie = require("../MovieModel");
const User = require("../UserModel");
const express = require('express');

// const faker = require('faker'); 
let router = express.Router();


router.get("/", displayAll);
router.get("/search", searchppl);
router.put("/:pid/Updatefollowing", updateFollowing);

router.get("/:pid", findCollab, sendSinglePerson);
// router.post("/", express.json(), createPerson);
// router.put("/:pid", express.json(), savePerson);

router.post("/", express.json(), createPerson); //localHost:3000/people/contribute

//NOTE: render the page differently depending on if a user is logged in or not 
//




router.param("pid", function(req, res, next, value){
	let oid;
	
	// console.log("Finding person by ID: " + value);
	if(req.session.loggedin){
		console.log("Logged IN!");
		User.findById(req.session._id, function(err, result){
			if(err){
				console.log("Error finding user.")
				res.status(500).send("Error reading user.");
				return;
			}
			if(!result){	
				console.log("0")
				res.status(404).render('partials/errors', {ErrorCode: "user " + value + " does not exist.", link:""}); 
        		return;
			}

			// req.user.populate("PeopleFollowed")
			console.log(result.PeopleFollowed);
			if(result.PeopleFollowed.includes(req.params.pid)){
				console.log("following")
			}
			// req.user = result;
			req.btnState=false;
			req.btnState = result.PeopleFollowed.includes(req.params.pid);

		})



	}

	try{
		oid = new ObjectId(value); //assigns the value Id to oid
	}catch(err){
		console.log("1");
		res.status(404).send("Person ID " + value + " does not exist.");
		
		return;
	}
	Person.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading person.");
			return;
		}
		if(!result){
			console.log("2")
			res.status(404).send("person ID " + value + " does not exist.");
			return;
		}
	
		result.populate({
			path: 'Actor Director Writer Collab'
			
		}, function(err, result){
			// console.log(result);

 		req.person = result;

 		next();
	
		})
		})
	
});



function searchppl(req,res,next){
	console.log("getting ppl")


	// Person.findName("Judy", function(err, result){
	// 	console.log(result);

	// })
	Person.find(function(err, result){
		// console.log(result);
		res.send(result);
	})
	// res.send("No")


}

function updateFollowing(req, res, next){
	
	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login")
		return;
	  }

	let pid = req.params.pid;

	User.findById(req.session._id, function(err, user){
		if(err){
			console.log("Error reading user.")
			res.status(500).send("Error reading user.");
			return;
		}
		if(!user){
			res.status(404).send("User not found."); 
			return;
		}
		// console.log(user);
		//should probably check to ensure we are not already following the person 
		if(user.PeopleFollowed.includes(pid)){
			console.log("Removing "+pid+" from PeopleFollowed!");
			user.PeopleFollowed.pull(pid);

			Person.findById(pid, function(err, p){
				p.Users.pull(req.session._id);
				p.save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error updating PeopleFollowed.");
						return;
					}
			 //or redirect to the main page 
					req.btnState = false; 
				})
			})
		}else{
			console.log("Adding "+pid+" to PeopleFollowed");
			user.PeopleFollowed.push(pid);
			Person.findById(pid, function(err, p){
				p.Users.push(req.session._id);
				p.save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error updating PeopleFollowed.");
						return;
					}
			 //or redirect to the main page 
					// req.btnState = true; --------idks
					console.log("okay")
				})
				

			})
		}

		user.save(function(err, result){
			if(err){
				console.log(err);
				res.status(500).send("Error updating PeopleFollowed.");
				return;
			}
			console.log("Successfully Update PeopleFollowed");
			// res.status(200).redirect(req.get('referer'));
			// res.status(201).send(JSON.stringify(newUser));
			res.status(200).send("Successfully Updated PeopleFollowed!")  //or redirect to the main page 
			
		})
		
	})
	
}




function displayAll(req, res, next){
	Person.find({}, function(err, people) {
		// console.log(users);
		res.render('../views/displayAllPeople', {people: people});
	 });
}



function getPerson(req, res, next){
	console.log(req.params.pid);
	Person.findOne({_id: req.params.pid}, function(err, result){ //change this to get the req.body 
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}
		
		if(!result){ //if the username is already taken 
			console.log("3")
			res.status(404).send("person ID does not exist."); //change the status code
			return;
		};

		Movie.findMovies(req.params.pid, function(err, mResult){
			if (err) throw err;
			let mList = mResult;
			// console.log(mList);
		// res.status(200).send("hi");
		res.format({
			"application/json": function(){
				res.status(200).json(result);
			},
			"text/html": () => { res.status(200).render("../views/person", {person: result, work: mList}); } //maybe create a movie obj + a people names object 
		});
		
		next();
	})
});
}



function savePerson(req, res, next){
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



function createPerson(req, res, next){

	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login")
		return;
	}
	User.findById(req.session._id, function(err, user){
		if (err) throw err;
		
		//checks to ensure the user is a contributing user
		if(!user.Contributer){
			console.log("Not a contributing user!")
			res.status(403).render('partials/errors', {ErrorCode: "Not a contributing user!", link: ''}); 
			return;
		}

	let p = new Person();
	p._id = mongoose.Types.ObjectId();
	p.Name = req.body.name;
	p.Users = [];
	let re = new RegExp(`^${req.body.name}$`, "i");
	Person.findOne({Name: re}, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}
		
		if(result){ //if the person already exists 
			//alert("User "+req.body.username+" exists.");
			res.status(400).send("Person ID " + req.body.name + " exists."); //change the status code
			return;
		}
		console.log("Person validation passed!");
	p.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error creating Person.");
			return;
		}
		res.status(201).redirect("../../people/"+p._id)
		// res.status(201).send(JSON.stringify(p));
	})})
})}


function findCollab(req, res, next){
	// console.log("finding collab");
	let pplArrs = []
	let ppl = []

	// console.log(req.person)
	let freq = new Map();

	//  console.log(main[0][1].Actor[0]);
	//main[0] -> Actors
	//main[1] -> Directed
	//main[2] -> wrote 
	
	//main[i][j] - > gives movie object 
	//main[i][j].Actor -> gives actor array of said movie object 

	//main[0][0]

	//pushes each movie into it's own array element

	for(y in req.person.Actor){
		
		pplArrs.push(req.person.Actor[y].Actor);
		pplArrs.push(req.person.Actor[y].Director)
		pplArrs.push(req.person.Actor[y].Writer)
	}

	for(y in req.person.Director){
	
		pplArrs.push(req.person.Director[y].Actor);
		pplArrs.push(req.person.Director[y].Director)
		pplArrs.push(req.person.Director[y].Writer)
	}
	
	for(y in req.person.Writer){
	
		pplArrs.push(req.person.Writer[y].Actor);
		pplArrs.push(req.person.Writer[y].Director)
		pplArrs.push(req.person.Writer[y].Writer)
	}
	// console.log(pplArrs)

//Need a way to account for a person starring in the same movie as different roles 


	//  console.log(pplArrs[0][0])
	//pplArrs[y] 	 - > individual movie 
	//pplArrs[y][0]  - > actors of movie
	//pplArrs[y][1]  - > Directors of movie
	//pplArrs[y][2]	 - > Writers of movie 


	for(index in pplArrs){
	//  console.log(pplArrs[index])
		for(pIndex in pplArrs[index]){
			ppl.push(pplArrs[index][pIndex])
		}
	}



//	console.log(ppl)
	
	for(index in ppl){
		// console.log(freq.has(String(ppl[index])))
		if(freq.has(String(ppl[index]))){
			let c = freq.get(String(ppl[index]));
			freq.set(String(ppl[index]), c + 1);
			
		}else{
			freq.set(String(ppl[index]), 0);
		}
	}

	// console.log(freq)
	// console.log(req.person._id)
	freq.delete(String(req.person._id)) //Deletes the person from their own collaborators list 
	// console.log("sorting")
	
	let newMap = new Map([...freq].sort(([k, v], [k2, v2])=> {
		if (v > v2) {
		  return -1;
		}
		if (v < v2) {
		  return 1;
		}
		return 0; 
	  }));
	  
	  let col = []
	//   console.log(newMap.size)
	if(newMap.size > 0){
		for(i = 0; i < 5; i++){
			let z = Array.from(newMap)[i];
			if(z){
				// console.log(z);
				// console.log(z[0])
				col.push(z[0])
			}
		}
	}
	   	// console.log(col);
		req.person.Collab = col;
	    req.person.populate("Collab", function(err, result){
		
		req.person = result

		//potentially save these results to db
		next();
	   })
  

	}
function sendSinglePerson(req, res, next){
	// console.log(req.btnState);
	res.format({
		"application/json": function(){
			res.status(200).json(req.person);
		},
		"text/html": () => { res.render("../views/person", {person: req.person, logged: req.btnState}); }
	});
	
	next();
}



module.exports = router;