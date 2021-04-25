const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Movie = require("../MovieModel");
const Person = require("../PeopleModel");
const User = require("../UserModel");
const Review = require("../ReviewModel");
const express = require('express');


let router = express.Router();

router.get("/", displayAll);
router.post("/", createMovie, NotifyUsers); 

router.get("/search", express.json(), search);

router.put("/:mid/Watchlist", watchlist);
router.get("/:mid", sendSingleMovie);

router.param("mid", function(req, res, next, value){
	let oid;
	if(req.session.loggedin){
		console.log("Logged IN!");
		User.findById(req.session._id, function(err, result){
			if(err){
				console.log("Error finding user.")
				res.status(500).send("Error reading user.");
				return;
			}
		
			console.log(result.Watchlist);
			if(result.Watchlist.includes(req.params.mid)){
				console.log("following")
			}
			// req.user = result;
			req.btnState=false;
			req.btnState = result.Watchlist.includes(req.params.mid);

	})	}

	try{
		oid = new ObjectId(value); //assigns the value Id to oid
	}catch(err){
	
		res.status(404).render('partials/errors', {ErrorCode: "Movie ID " + value + " does not exist.", link:""}); 
        return;
	}	
	Movie.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading movie.");
			return;
		}
		if(!result){
			console.log("movie ID " + value + " does not exist.");
			res.status(404).render('partials/errors', {ErrorCode: "Movie ID " + value + " does not exist.", link:""}); 
        	return;
		}
		Review.getReviewObj(req.params.mid, function(err, results){
			if (err) throw err;

			results.populate({path: 'Actor Director Writer Reviews.Author'}, function(err, result){
				req.movie = result;
				next();
			})
		})
	})
});

//prob delete this 
function displayAll(req, res, next){
	Movie.find({}, function(err, movies) {
		// console.log(users);
		res.render('../views/displayAllMovies', {movies: movies});
	 });
}


function search(req, res, next){
	// console.log(req.query);
//Replace fields that are not already using regex 
	if(req.query.page){
		// console.log(req.query.page)
	}else{
		req.query.page=1;
	}
	if(req.query.genre){

	}else{
		req.query.genre = new RegExp('', 'i');
	}

	//Find the search results  -- do a req.query.writer
	Movie.findMoviesWith(req.query.genre, req.query.title, req.query.actor, req.query.director, req.query.writer, function(err, result){
		if(err){
			console.log("Error querying movies.")
			res.status(500).send("Error with query.");
			return;
		}
		if(!result | result.length == 0){
			console.log("no")
			res.status(404).render("../views/search", {genres: genres});
			return;
		}
		//filters out the movies that did not contain the queried actors 
		let filtered = result.filter(function(x){
			return (x.Actor.length !== 0) && (x.Director.length !== 0) && (x.Writer.length !== 0);
		});
		if(filtered.length == 0){
			res.status(404).render("../views/search", {genres: genres});
			return;
		}
		lim = paginate(filtered, req.query.page);
		lim.All = filtered.length/10
		lim.two = []
		while(lim.length) lim.two.push(lim.splice(0,4));
	
		Movie.genres(function(err, genres){
			res.format({
				"text/html": () => { res.status(200).render("../views/search", {genres: genres, results: lim})},
				"application/json": () => {res.status(200).json(filtered)}
				});
		})

	})
}

function paginate(arr, page){
	let results = [];
	let startIndex = (page-1) * 10;
	let endIndex = startIndex + 10;
	let count = 0;

	for(x in arr){
		if(count >= startIndex){
			results.push(arr[x]);
		}
		if(results.length >= 10){
			break;
		}
		count++;
	}
	return results;
}


function watchlist(req, res, next){
	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login")
		return;
	}
	let mid = req.params.mid;
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
		//check to ensure the movie is not already on the watchlist  
		if(user.Watchlist.includes(mid)){
			console.log("Removing "+mid+" from Watchlist!")
			user.Watchlist.pull(mid);
		}else{
			console.log("Adding "+mid+" to Watchlist!")
			user.Watchlist.push(mid);
		}
		
		user.save(function(err, result){
			if(err){
				console.log(err);
				res.status(500).send("Error updating Watchlist.");
				return;
			}
			console.log("Watchlist updated!");
			res.status(200).send("Watchlist updated!") 
		})
	})
}


function createMovie(req, res, next){
	req.castList = [];
	let flag = true;

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

		//checks to ensure the user is a contributing user
		if(!user.Contributer){
			console.log("Not a contributing user!")
			res.status(403).render('partials/errors', {ErrorCode: "Not a contributing user!", link: ''}); 
			return;
		}
	let m = new Movie();

//Required attributes 
	m._id = mongoose.Types.ObjectId();
	m.Title = req.body.title;
	m.Year = req.body.year;
	m.Runtime = req.body.runtime;
	m.Plot = req.body.plot;
	m.Reviews = [];
	//OPTIONAL 
	m.Released = req.body.released;
	m.Awards = req.body.awards;
	m.Poster = req.body.poster;

	if(req.body.actorINPUT.length === 0 || req.body.directorINPUT.length===0 || req.body.writerINPUT.length===0 || req.body.genreINPUT.length===0){
		console.log("no data was sent with the arrays")
		res.status(400).render('partials/errors', {ErrorCode: "Required fields were left blank", link:"Contribute"}); 
        return;

	}

	for(x in req.body.genreINPUT){
		if(req.body.genreINPUT[x] === ''){
			// console.log('empt value')
		}
		else{
			m.Genre.push(req.body.genreINPUT[x])
		}
	}

	let insensitiveActors = makeRegexArr(req.body.actorINPUT)
	let insensitiveDirectors = makeRegexArr(req.body.directorINPUT)
	let insensitiveWriters = makeRegexArr(req.body.writerINPUT)

	// console.log(insensitiveActors);
	// console.log(insensitiveDirectors);
	// console.log(insensitiveWriters);


	Person.findbyNames(insensitiveActors, function(err, aID){
			// console.log(result);
			// console.log("Length of body.actor: "+req.body.actorINPUT.length-1+" vs  Length of aID: "+aID.length);
			if(err){
				console.log("Error: query.")
				res.status(500).send("Error: query.");
				return;
			}
			if(aID.length === 0){
				console.log("Actor not found")
				flag = false;
			}else{
			for(x in aID){
				// console.log(aID[x]._id)
				m.Actor.push(aID[x]._id)
				aID[x].Actor.push(m._id)
				req.castList.push(aID[x]);
			}}
	Person.findbyNames(insensitiveDirectors, function(err, dID){
			// console.log(result);
			// console.log("Length of body.direcrtor: "+req.body.director.length-1+" vs  Length of dID: "+dID.length);
			if(err){
				console.log("Error querying.")
				res.status(500).send("Error with query.");
				return;
			}
			if(dID.length === 0){
				// res.status(404).send("Director not found")
				// returno
				console.log("Director not found")
				flag = false;
				
			}else{
			for(x in dID){
				// console.log(result[x]._id)
				m.Director.push(dID[x]._id)
				dID[x].Director.push(m._id)
				req.castList.push(dID[x]);
			}}

	Person.findbyNames(insensitiveWriters, function(err, wID){
				// console.log(result);
				// console.log("Length of body.writer: "+req.body.writer.length-1+" vs  Length of wID: "+wID.length);
				if(err){
					console.log("Error querying.")
					res.status(500).send("Error with query.");
					return;
				}
				
				if(wID.length === 0){
					console.log("Writer not found")
					flag = false;
				
				}else{
					for(x in wID){
						m.Writer.push(wID[x]._id)
						wID[x].Writer.push(m._id)
						req.castList.push(wID[x]);
					}
				}

		// console.log(flag);


	Movie.findOne({Title: req.body.title}, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading movie.");
			return;
		}
		//Have a check for lowercase like 
		//if result.Title.lowercase() === req.body.title.lowercase()
		if(result){
			res.status(400).render('partials/errors', {ErrorCode: "Movie ID " + req.body.title + " already exists.", link:"Contribute"}); 
        	return;
		}
	if(!flag){
		console.log("invalid cast members");
		res.status(404).render('partials/errors', {ErrorCode: "One or more specified cast members do not exist in this database.", link:"Contribute"}); 
        return;
	}
	if(flag){
	// console.log("Movie validation passed!");
	//save people
	for(x in aID){
		aID[x].save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error saving person.");
			return;
		}	
	})
	}
	for(x in dID){
		dID[x].save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error saving person.");
			return;
		}	
	})
	}
	for(x in wID){
		wID[x].save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error saving person.");
			return;
		}	
	})
	}
	
//save movie
	m.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error creating Movie.");
			return;
		}
	
		res.status(201).redirect("../../movies/"+m._id)
		next();
	})}
})
}) //}
})//end wID
		})//end dID

		})//end aID

	}
	


//helper function 
function makeRegexArr(arr){
	let regArr = [];
	console.log(arr);
	arr.forEach(function(elm)
	{
		if(elm === ''){
			console.log("empty");
		}
	let re = new RegExp(`^${elm}$`, "i");
	regArr.push(re);    
	})

	console.log(regArr);
	return regArr;
}


function NotifyUsers(req, res, next){
	console.log("notifying");
	// console.log(req.castList);
	let filtered = req.castList.filter(function(x){
		return x.Users.length !== 0;
	});
	console.log(filtered)
	for(x in filtered){
		filtered[x].populate("Users", function(err, result){
			for(index in result.Users){
				let str = result.Name + " has a new movie"
				result.Users[index].Notifications.push(str);
				// console.log(index);
				result.Users[index].save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error saving user.");
						return;
					}	
				})
			}
		})
	}
}
	


function sendSingleMovie(req, res, next){
	// console.log(req.btnState);
	Movie.findMoviesWith(req.movie.Genre, '', '', '', function(err, result){
		let random = result.sort(() => .5 - Math.random()).slice(0,5)

	res.format({
		"application/json": function(){
			res.status(200).json(req.movie);
		},
		"text/html": () => { res.status(200).render("../views/movie", {movie: req.movie, similar: random, logged: req.btnState}); }
	});
		})
}






module.exports = router;