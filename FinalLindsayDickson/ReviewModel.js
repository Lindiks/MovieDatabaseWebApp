const mongoose = require("mongoose");
const Schema = mongoose.Schema;


let reviewSchema = Schema({
    Author:   //will be the username //probably should be a 'User' reference bc you need the _id as well as the user
        {type: Schema.Types.ObjectId, ref: 'User'/*, required: true*/},
    Title: {
        type: String,
        required: true
    },
    Rating:{
        type: Number,
        required: true, //use a validation function to ensure it meets the criteria of a valid rating 
        
    },
    Target: {type: Schema.Types.ObjectId, ref: 'Movie', required: true},
    Comments: [String]
    
})

reviewSchema.statics.getReviewObj = function(mid, callback){
    let reviews = []; 
    this.model('Movie')
	.findOne({ _id: mid})
	.populate('Reviews')// <--
	.exec(callback)
}





module.exports = mongoose.model("Review", reviewSchema);