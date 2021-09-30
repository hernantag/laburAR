const express = require('express')
const passport = require('passport')
const router = express.Router()
const {loggedIn,isOfertante} = require('../../passport/helpers')





router.get('/inicio/Ofertante', loggedIn,isOfertante,  (req,res,next) =>{
    res.render('inicioOfer.ejs')
})

module.exports = router;