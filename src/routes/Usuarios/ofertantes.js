const express = require('express')
const passport = require('passport')
const router = express.Router()
const pool = require("../../database/database");
const {loggedIn,isOfertante} = require('../../passport/helpers')





router.get('/inicio/Ofertante', loggedIn,isOfertante,  (req,res,next) =>{
    res.render('inicioOfer.ejs')
})

router.get('/Ofertante/Empleo', loggedIn,isOfertante, async (req,res,next) =>{
    res.redirect('/Ofertante/Empleo/1')

})


router.get('/Ofertante/Empleo/:page', loggedIn, isOfertante, async (req,res,next) =>{

            if (req.params.page < 1){
                      
                      
              res.redirect('/Ofertante/Empleo')
            next()
            }
          
          let page = ((req.params.page - 1 )*5)
          let solicitudes = await pool.query("SELECT * FROM solicitud LIMIT ?, ?;",[page,5]);
          let nombre = req.user.nombre
          let pagina = (req.params.page)
          let total = await pool.query("SELECT * FROM solicitud");
          total = total.length
          console.log(pagina)

          res.render('empleoOfer.ejs',{
            solicitudes,nombre,pagina,total

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