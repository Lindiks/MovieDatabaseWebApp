const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    Username: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30,
        // match: /[A-Za-Z]+/, //no special characters
        trim: true          //removes whitespace from both ends of the string
    },
    Password:{
        type: String,
        required: true,
        minlength: 1,
        maxlength: 30,
        // match: /[A-Za-Z]+/, 
        trim: true          
    },
    Contributer: Boolean,
    PeopleFollowed: [{type: Schema.Types.ObjectId, ref: 'Person'}],  //should maybe hold the name, ID, link
    UsersFollowed:  [{type: Schema.Types.ObjectId, ref: 'User'}], //should maybe hold the usersname, ID, link
    Watchlist:[{type:Schema.Types.ObjectId, ref: 'Movie'}],        //should maybe hold the title, ID, link, Poster (just make a reference document )
    Reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],      //will hold the review id's to be retrieved from a getter? // look into 14-ex5 & 6
    Notifications: [{type: String}], //can probably modify this + recommended to hold more attributes
    Recommended: [{type: Schema.Types.ObjectId, ref: 'Movie'}],
    FollowedBy: [{type: Schema.Types.ObjectId, ref: 'User'}]
})



userSchema.statics.findByUsername = function(name, callback){
    this.findOne({Username: name}, callback);
}






module.exports = mongoose.model("User", userSchema);