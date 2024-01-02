const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const checkAuth = require('../../middleware/checkAuth');
const { default: mongoose } = require('mongoose');

router.post('/signup', async (req, res, next) => {    
        
        const user = await User.findOne({email : req.body.email});
        if (!user){
            bcrypt.hash(req.body.password, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({
                        message: e.message
                    });
                }
                else{
                    try {
                        
                        const newUser = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            username: req.body.username,
                        });
                            
                        const result = await newUser.save(); 
                        console.log(result)

                        return res.status(201).json({
                            message: result
                        });
                    }
                    catch(e){               
                        return res.status(500).json({
                            message: e.message
                        });
                    }
                }
            });
        }else{
            return res.status(409).json({
               message: "Email already exist" 
            });
        }
    }
);

router.post('/login', async (req, res, next) => {
    
    const user = await User.findOne({email: req.body.email});
    
    if (user == undefined){
        return res.status(401).json({
            message: "Auth Failed"
        });
    }else{
        try{
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {

                const token = jwt.sign(
                    {
                        email : user.email,
                        uid: user._id 
                    },
                    'secret'
                );   
                return res.status(201).json({
                    message: "Logged in successfully",
                    username: user.username,
                    uid: user._id, 
                    token: token
                });
            }else{
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
        }
        catch(e){
            return res.status(500).json({
                message: e.message
            });
        }
    }
});  


router.post('/:userId/follow', checkAuth, async (req, res, next) => {
    try {
        const currUserId =  req.userData.uid;
        const toFollow = req.params.userId;
        const user = await User.findById(currUserId);
        console.log("object");
        console.log(user);
        if (user.following.includes(toFollow)){

            return res.status(409).json({
                message: "Already Following"
            });
             
        }else{

            await User.findOneAndUpdate({_id: currUserId}, {
                $push: { following : toFollow}
            });

            await User.findOneAndUpdate({_id: toFollow}, {
            $push: { followers: currUserId } 
            });

            return res.status(200).json({
                message: "U started following"
            });

        }
    
    } catch (e) {

        return res.status(500).json({
            message: e.message
        });

    }
});

router.post('/:userId/unfollow', checkAuth, async (req, res, next) => {
    try {
          const currUser = req.userData.uid;
          const toUnFollow = req.params.userId;
          

          const user = await User.findById(currUser);
          if (user.following.includes(toUnFollow) == true){
            
            await User.findOneAndUpdate({_id: currUser}, {
                $pull: {following: toUnFollow}
            });
            
            await User.findOneAndUpdate({_id: toUnFollow}, {
                $pull : { followers: currUser}
            });
            
            //   const user = await User.findById(currUser);

            //   for (let i = 0; i < user.myFeed.length; i++){
            //     const post = await Post.findById(user.myFeed[i]);
            //     if (post.poster == toUnFollow){
            //         if (post._id != undefined){
            //             await User.findOneAndUpdate({_id: currUser}, {
            //                 $pull : { myFeed : post._id}
            //             }); 
            //         }
            //     }                        
            //   }

            return res.status(200).json({
                message: `You unfollowed ${toUnFollow}`
            });
        }


    } catch (e) {
        return res.status(201).json({
            message: e.message
        });
    }
});

module.exports = router;