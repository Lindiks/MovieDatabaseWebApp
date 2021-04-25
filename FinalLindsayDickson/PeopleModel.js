const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Movie = require("./MovieModel");
const User = require("./UserModel");


let personSchema = Schema({
    Name: {
        type: String,
        required: true
        // minlength: 1,
        // maxlength: 30,
        // match: /[A-Za-Z]+/, //no special characters
    },
    Director: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
    Actor: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
    Writer: [{type:Schema.Types.ObjectId, ref: 'Movie'}],
    Collab: [{type: Schema.Types.ObjectId, ref: 'Person'}], //maybe make a person ref

    Users: [{type: Schema.Types.ObjectId, ref: 'User'}]
})


personSchema.methods.findppl = function(name, callback){
    this.model("Person").find()
    .where("Name").equals(new RegExp(name, 'i'))
    .exec(callback)
}


personSchema.statics.findPeople = function(mid, callback){
    let actorList = []; 
    actorList["Actor"] = [];
    actorList["Director"] = [];
    actorList["Writer"] = []; 
    this.model('Movie')
	.findOne({ _id: mid})
	.populate('Actor Director Writer') // <--
	.exec(function (err, movie) {
	if (err) throw err;
    
	for(let i = 0; i < movie.Actor.length; i++){
            x = {}
            x.Name = movie.Actor[i].Name;
            x._id = movie.Actor[i]._id;
			actorList["Actor"].push(x);
	} 
	for(let i = 0; i < movie.Director.length; i++){
        x = {}
        x.Name = movie.Director[i].Name;
        x._id = movie.Director[i]._id;
        actorList["Director"].push(x);
	} 

	for(let i = 0; i < movie.Writer.length; i++){
        x = {}
        x.Name = movie.Writer[i].Name;
        x._id = movie.Writer[i]._id;
        actorList["Writer"].push(x);
	} 

    callback(null, actorList);
    })
}

//static method




//can be used for searching 
personSchema.query.findByName = function(name, callback){
    return this.find({Name: new RegExp(name, 'i')}, callback);
}

personSchema.statics.findbyNames = function(names, callback){
    this.find()
    .where("Name").in(names)
    .exec(callback)
}


personSchema.statics.findName = function(name, callback){
    this.find({Name: new RegExp(name, 'i')}, callback);
    // for(i=0; i < IdArray.length; i++){
    //     this.find()
    //     .populate("_id").exec(callback);
            
    // }
    // console.log(JSON.parse(IdArray));
    // // IdArray.array.forEach(elm => {
    // //      this.find({_id: pid}, function(err, callback){       
    // // }).exec(callback);
    // // });
    // this.find({_id: pid}, function(err, callback){  
           
    //      }).exec(callback);
}


module.exports = mongoose.model("Person", personSchema);