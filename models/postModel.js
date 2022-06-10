const mongoose = require('mongoose')

const postsModel = mongoose.Schema({
    user: String,
    imgName: String,
    text: String,
    avatar: String,
    timestamp: String
})

const Posts = mongoose.model('posts',postsModel)

exports.Posts = Posts 
