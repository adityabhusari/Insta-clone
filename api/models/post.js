const mongoose = require('mongoose');

const postModel = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    poster: {type: mongoose.Schema.Types.ObjectId, required: true},
    image: {type: String},
    likes: {type: Number, default: 0},
    caption: {type: String}, 
    comments: {type: Array, default: []}

});

module.exports = mongoose.model('Post', postModel);