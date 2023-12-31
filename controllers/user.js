const User = require('../models/userSchema')
const bcrypt = require('bcryptjs') 
const mid = require('../middleware/index')

exports.signUp = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const username = await User.findOne({username: req.body.username})

    if (user) {
        let err = {
            status: 401,
            message: "Email Already Exists"
        }
        return next(err)
    } else if (username) {
        let err = {
            status: 401,
            message: 'Username Already Exists'
        }
        return next(err)
    } else if (req.body.password < 8 || req.body.username < 5) {
        let err = {
            status: 401,
            message: "min password/username length = 8/5"
        }
        return next(err)
    }
    
    // Note: I'm receiving json obj from req & express.json() is the req.body object readable. 
    const newUser = new User ({...req.body})

    newUser.save()
        .then ((data) => {
            // console.log(data)
            const {name, username, bio, photo, posts, age, _id} = data

            req.session.userId = data._id
            req.session.userData = {name, username, bio, photo, age, posts, _id}

            res.json({
                'user': 'A new User Has being Created'
            })
        })
        .catch((err) => {
            return next(err)
        })
}

exports.logIn = async (req, res, next) => {
    try {
        // check if the user exists
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          //check if password matches
          const result = await bcrypt.compare(req.body.password, user.password);
          if (result) { 
            req.session.userId = user._id
            const {name, username, bio, photo, posts, age, _id} = user
            req.session.userData = {name, username, bio, photo, age, posts, _id}

            const pipeline = [
                {
                    $lookup: {
                    from: 'posts',
                    localField: 'username',
                    foreignField: 'authorUserName',
                    as: 'posts'
                    }
                },
                // {$out: "users"}
            ];
    
            function updateCurrentUser() {
                User.aggregate(pipeline)
                .then(data => {
                    const {userData} = req.session
                    // console.log(data)
                    const filtered = data.filter(data => data.username == userData.username)
                    console.log(filtered)
                    req.session.userData = filtered[0]
                    
                    res.json({
                        loggedIn: true,
                        userId: req.session.userId,
                        userData: req.session.userData
                    })
                })
                .catch(err => next(err))
            }

            updateCurrentUser()
          } else {
            const err = {
                status: 400,
                message: "password dose'nt match"
            }
            next(err)
          }
        } else {
            const err = {
                status: 400,
                message: "User doesn't exist"
            }
            next(err)
        }
        } catch (error) {
            next(error)
    }
}

exports.logout = async (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            return next(err)            
        }

        return res.json({
            status: 201,
            message: 'You are logged out'
        })
    })

}
