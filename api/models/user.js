const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    
    _id: mongoose.Schema.Types.ObjectId,

    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, required: true},
    myPosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    myFeed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    likedPosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    myComments: [{type: String}]
    
});
 
module.exports = mongoose.model('User', userModel);       