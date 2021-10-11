const express = require('express')
const passport = require('passport')
const router = express.Router()
const path = require('path')
const pool = require('../database/database')

router.get('/inicio', (req,res,next) =>{
    res.render('inicio.ejs')
})





router.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/',
    failureRedirect:'/signup',
    passReqToCallback:true
}))

router.post('/signin', passport.authenticate('local-signin',{
    successRedirect:'/',
    failureRedirect:'/signin',
    passReqToCallback:true
}))

router.get('/prueba', (req,res) =>{
    usuario = {
        nombre:'jose',
        apellido:'perez'
    }
    
    res.render('prueba.ejs',usuario)
} ) 


router.get('/', (req,res,next) =>{
    if (req.isAuthenticated()){
        if (req.user.tipo == "ofertante") res.redirect("/Ofertante/Empleo/1");
        if (req.user.tipo == "solicitante") res.redirect("/solicitante/empleo/1");
        if (req.user.tipo == "admin") res.redirect("/inicio/Admin");
    }
    res.render('index.ejs')
})




router.get('/signup', (req,res,next) =>{
    res.render('signup.ejs')
})








router.get('/signin', (req,res,next) =>{
    res.render('signin.ejs')
})

router.get('/profile',isAuthenticated, (req,res,next) =>{
    res.render('profile')
})

router.get('/logout', (req,res,next) =>{
    req.logOut();
    res.redirect('/')
})

function isAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/')
    }
}


module.exports= router