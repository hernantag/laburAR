const express = require('express')
const passport = require('passport')
const router = express.Router()

router.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/inicioOfer',
    failureRedirect:'/signup',
    passReqToCallback:true
}))
