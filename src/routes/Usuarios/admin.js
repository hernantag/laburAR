const express = require('express')

const router = express.Router()
const {loggedIn,isAdmin} = require('../../passport/helpers')




router.get('/inicio/Admin', loggedIn,isAdmin,  (req,res,next) =>{
    res.render('inicioAdmin.ejs')
})

module.exports = router;