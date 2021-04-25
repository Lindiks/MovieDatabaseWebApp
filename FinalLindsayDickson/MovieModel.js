const mongoose = require("mongoose");
const Person = require("./PeopleModel")
const Schema = mongoose.Schema;


let movieSchema = Schema({
    Title: {
        type: String,
        required: true,
    },
    Year: String,
    Rated: String,
    Released: String,
    Runtime: String,   
    Genre: [String],
    Director: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
    Actor: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
    Writer: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}],
    Plot: {type: String},
    Awards: [String],
    Poster: String,
    Reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]//array of review ID's?   
})




movieSchema.statics.findMovies = function(pid, callback){
    let workList = [];
    workList["Actor"] = [];
    workList["Director"] = [];
    workList["Writer"] = [];
    this.model("Person")
    .findOne({_id: pid})
    .populate("Actor Director Writer")
    .exec(function(err, person){
        if(err) throw err;

        for(let i = 0; i < person.Actor.length; i++){
            x = {}
            x.Title = person.Actor[i].Title;
            x.Poster = person.Actor[i].Poster;
            x._id = person.Actor[i]._id;
            workList["Actor"].push(x);
        }

        for(let i = 0; i < person.Director.length; i++){
            x = {}
            x.Title = person.Director[i].Title;
            x.Poster = person.Director[i].Poster;
            x._id = person.Director[i]._id;
            workList["Director"].push(x);
        }

        for(let i = 0; i < person.Writer.length; i++){
            x = {}
            x.Title = person.Writer[i].Title;
            x.Poster = person.Writer[i].Poster;
            x._id = person.Writer[i]._id;
            workList["Writer"].push(x);
        }

        callback(null, workList);
    })
}

// //static methods for finding genre? 
movieSchema.methods.limitRes = function(callback){
    return this.limit(4).exec(callback);
}


movieSchema.statics.findMoviesWith = function(genre, title, Aname, Dname, Wname, callback){
    this.find()
    .where("Genre").in(genre)
    .where("Title").equals(new RegExp(title, 'i'))
    
    .populate({
        path: 'Actor',
        match: {"Name": new RegExp(Aname, 'i')}
        // options: {
        //     // perDocumentLimit: 2
        // }

    })
   
    .populate({

        path: 'Director',
        match: {"Name": new RegExp(Dname, 'i')}  
    })
    .populate({

        path: 'Writer',
        match: {"Name": new RegExp(Wname, 'i')}  
    })
    // .slice()
    // .where("Actor.1").exists(true)
    // .where("Actor.length>0")
    // .slice()
    // .where("Actor.1", {$exists: true}) //this line is useless
    // // .skip((page-1)*10)
    
 
    .exec(callback)
    // .exec(cal
}


movieSchema.statics.findMoviesBasic = function(genre, mid, callback){
    this.find()
    .where("_id").nin(mid)
    .where("Genre").in(genre)
    .limit(25)
    .exec(callback)
}

// //static method - can be used for searching 
movieSchema.statics.findByTitle = function(title, callback){
    this.find({Title: new RegExp(title, 'i')}, callback);
}



movieSchema.statics.findByGenre = function(genre, callback){  //<=== prob dont need this bc we dont use it 
    this.find({Genre: genre}, callback);
}


//Gathers the genres for the drop-down menu displayed on the search page 
movieSchema.statics.genres = function(callback){
    this.find().distinct("Genre").exec(callback);
}

module.exports = mongoose.model("Movie", movieSchema);


