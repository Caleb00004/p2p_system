const express = require('express')
const mid = require('../middleware/index')
const router = express.Router()
const {signUp, logIn, logout} = require('../controllers/user')


// code to handle Signinig up / creating User
router.post('/sign-up', mid.AlreadyLogged, signUp )

// code to handle Log IN
router.post('/log-in', logIn)

// To Handle Logging Out
router.post('/logout', mid.requiresLogin , logout)

// exporting the router
module.exports = router

