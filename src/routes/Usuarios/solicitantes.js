const express = require('express')

const router = express.Router()
const {loggedIn,isSolicitante} = require('../../passport/helpers')




router.get('/inicio/Solicitante', loggedIn,isSolicitante,  (req,res,next) =>{
    res.render('inicioSolicer.ejs')
})





module.exports = router;