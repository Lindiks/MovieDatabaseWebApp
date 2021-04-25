const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const express = require('express');

const Review = require("../ReviewModel");
const User = require("../UserModel");
const Movie = require("../MovieModel");

let router = express.Router();


router.post("/", express.json(), createReview, notifyUsers);

// router.get("/:rid", express.json(), getReview); //is this needed? 





function createReview(req, res, next){
    let newReview = new Review();

	if(!req.session.loggedin){
		console.log("not logged in");
		res.status(401).redirect("../../Login")
		return;
	  }


	newReview._id = mongoose.Types.ObjectId();
	newReview.Author = req.session._id;
	newReview.Target = req.body.movie;
	newReview.Title = req.body.title;
	newReview.Rating = req.body.rating;
	newReview.Comments = req.body.text;

	newReview.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error creating review.");
			return;
		}
		console.log("review created");
		//going to want to add it to the MovieReviews and the UserReviews before sending 
		User.findById(req.session._id, function(err, user){
			if (err) throw err;
			user.Reviews.push(newReview._id)
			req.curUser = user;
			Movie.findById(req.body.movie, function(err, movie){
				movie.Reviews.push(newReview._id);
				if(!result){
					res.status(404).send("movie not found."); 
					return;
				
				}
				user.save(function(err, result){
					if(err){
						console.log(err);
						res.status(500).send("Error saving user.");
						return;
					}
					
					movie.save(function(err, result){
						if(err){
							console.log(err);
							res.status(500).send("Error saving movie.");
							return;
						}
						
					})
				})
			})
			next();
		})

		//or redirect to the main page 
		res.status(201).redirect(req.get('referer'));
		
	})	

}


function notifyUsers(req, res, next){
	// console.log("notify")
	// console.log(req.curUser);
	req.curUser.populate("FollowedBy", function(err, result){
		// console.log(result)
		for(index in result.FollowedBy){
			let str = result.Username + " has added a new review"
			result.FollowedBy[index].Notifications.push(str);
			result.FollowedBy[index].save(function(err, result){
				if(err){
					console.log(err);
					res.status(500).send("Error saving user.");
					return;
				}
			})
		}


	})
}


function getReview(req, res, next){

}




module.exports = router;