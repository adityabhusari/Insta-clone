const express = require('express');
const checkAuth = require('../../middleware/checkAuth');
const User = require("../models/user");
const Post = require("../models/post");
const multer = require('multer');
const { default: mongoose } = require('mongoose');

const router = express.Router();

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, './uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    }
);

const upload = multer({

    storage: storage,
});

//POST a post
router.post('/posts', checkAuth, upload.single('image'), async (req, res, next) => {
    try{
    
        const currUserId = req.userData.uid;
        const postId = new mongoose.Types.ObjectId();
        const currUser = await User.findById(currUserId);
        const post = new Post({
 
            _id: postId,
            poster: currUserId,
            caption: req.body.caption,
            image: req.file.path 

        });
        
        const result = await post.save();

        if (result != null){ 

            await User.findOneAndUpdate({_id: currUserId}, {
                $push: { myPosts: postId }
            });

            for (let i = 0; i < currUser.followers.length; i++){
                await User.findOneAndUpdate({_id: currUser.followers[i]}, {
                    $push: {myFeed: postId}
                });
            };
            
            return res.status(201).json({
                mnessage: "Succesfully Posted",
                post: result
            }); 
 
        }else{

            return res.status(409).json({
                message: "Unable to post"    
            });

        }
    

    }
    catch(e){

        return res.status(500).json({
            message : e.message
        });
    }
}); 

//GET myFeed
router.get('/posts', checkAuth, async (req, res, next) => {
    
    try {
        const currUserId = req.userData.uid;

        // var result = await User.findById(currUserId)
        
        // var posts = await Post.find();
        
        // for (let i = 0; i < posts.length; i++){
        //     for (let j = 0; j < result.following.length; j++){   
        //         if (result.following[j].equals(posts[i].poster) == true && result.myFeed.includes(posts[i]._id) == false){
        //             await User.findOneAndUpdate({_id: currUserId}, {
        //                 $push : { myFeed: posts[i]._id}
        //             });
        //         }
        //     }
        // }

        result = await User.findById(currUserId);

        return res.status(200).json({
            feed: result.myFeed
        });

        
    } catch (e) {

        return res.status(500).json({
            message: e.message
        });
        
    }
});

router.get('/posts/:postId', checkAuth, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        
        const post = await Post.findById(postId);

        return res.status(200).json({
            post: post
        });

    } catch (e) {

        return res.status(500).status({
            message: e.message
        });                                                                 
    }
 
});

//DELETE a post

router.delete('/posts/:postId', checkAuth, async (req, res, next) => {
    try{
    const currUser = req.userData.uid;
    const postId = req.params.postId; 
    const user = await User.findById(currUser); 
    const post = await Post.findById(postId);
    
    if (post == null){

        return res.status(404).json({
            message: "Post doesn't exist"
        });

    } 
    else{

        await User.findOneAndUpdate({_id: currUser}, {
            $pull : { myPosts: postId }    
        },
        {new: true});

        await Post.findByIdAndDelete(postId);

        for (let i = 0; i < user.followers.length; i++){
            await User.findOneAndUpdate({_id: user.followers[i]}, {
                $pull: {myFeed: postId}
            });
        };

        return res.status(202).json({
            message: "Deleted successfully"
        });
        
        }
    }
    catch(e){
        return res.status(500).json({
            message: e.message
        });
    }
});

//POST a comment

router.post('/posts/:postId/comments', checkAuth, async (req, res, next) => {
    try {
        const currUserId = req.userData.uid;
        const postId = req.params.postId;
        const comment = req.body.comment;
  
        const post = await Post.findOneAndUpdate({_id: postId}, {
             $push : { comments: comment } 
        });

        await User.findOneAndUpdate({_id: currUserId}, {
            $push: { myComments: comment }
        });
        
        return res.status(201).json({
            message: "Commented successfully"
        });


    } catch (e) {

        return res.status(500).json({
            message: e.message
        });

    }
});

router.post('/posts/:postId/unlike', checkAuth, async (req, res, next) => {
    
    const currUserId = req.userData.uid;
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    try{
        if (post != null){
            
            
            const currUser = await User.findById(currUserId);
            
            if (currUser.likedPosts.includes(postId) == true){

                    await User.findOneAndUpdate({_id: currUserId},{
                    $pull : {likedPosts: postId}
                    });

                    await Post.findOneAndUpdate({_id: postId}, {
                        $inc: {likes: -1}
                    });

                    return res.status(201).json({
                        message: "You unliked"
            });

            }else{
                return res.status(201).json({
                    message: "Already unliked"
                });
            }

        }else{
            
            return res.status(404).json({
                message: "Post unavailable"
            });

        }
    }catch(e){
        
        return res.status(500).json({
            message: e.message
        });

    }

});

router.post('/posts/:postId/like', checkAuth, async (req, res, next) => {
    
    const currUserId = req.userData.uid;
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    try{
        if (post != null){
            
            await Post.findOneAndUpdate({_id: postId}, {
                $inc: {likes: 1}
            });
            
            const currUser = await User.findById(currUserId);
            
            if (currUser.likedPosts.includes(postId) == false){

                    await User.findOneAndUpdate({_id: currUserId},{
                    $push : {likedPosts: postId}
                    });

                    return res.status(201).json({
                        message: "You liked"
            });

            }else{ 
                return res.status(201).json({
                    message: "Already liked"
                });
            }

        }else{
            
            return res.status(404).json({
                message: "Post unavailable"
            });

        }
    }catch(e){
        
        return res.status(500).json({
            message: e.message
        });

    }

});

module.exports = router; 

