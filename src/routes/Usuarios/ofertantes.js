const express = require('express')
const passport = require('passport')
const router = express.Router()
const pool = require("../../database/database");
const {loggedIn,isOfertante} = require('../../passport/helpers')





router.get('/inicio/Ofertante', loggedIn,isOfertante,  (req,res,next) =>{
    res.render('inicioOfer.ejs')
})

router.get('/Ofertante/Empleo', loggedIn,isOfertante, async (req,res,next) =>{
    let ofertas = await pool.query("SELECT * FROM oferta");
    console.log(ofertas)
    res.render('empleoOfer.ejs',{
        ofertas
    })

})

/* router.get("/cliente", async (req, res) => {
    let mensaje = req.flash("mensaje");
    let estacionamientos = await pool.query("SELECT * FROM estacionamiento");
    res.render("listaEstacionamientos", {
      estacionamientos,
      cliente: req.user,
      mensaje,
    });
  }); */

module.exports = router;