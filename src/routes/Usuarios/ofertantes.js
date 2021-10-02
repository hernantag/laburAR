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

          res.render('empleoOfer.ejs',{
            solicitudes,nombre,pagina,total

          })

  
          })


          router.post("/Ofertante/Empleo/Filter",loggedIn, isOfertante, async (req, res) => {

            
            let filtros = req.body;
            console.log(filtros)
           
          /*   let solicitud = await pool.query("SELECT * FROM vehiculo WHERE ID_Solicitud IS NOT NULL") */
            

            let consulta = 'SELECT * FROM solicitud WHERE '
            console.log(consulta)
            comilla = '"'
            let counterAND = 0

            //si viene vacio
          if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio'){
            
            res.redirect('/Ofertante/Empleo/')
            
          }
            else {
            //si viene con filtros
              if (filtros.Rubro != 'vacio'){
                  consulta = consulta + ' Rubro = ' + comilla + filtros.Rubro + comilla
                  console.log(consulta)
                  counterAND = (counterAND)-(-1)
              }
                //para agregar and
              if (filtros.Fecha != 'vacio'){
                
                        if (counterAND != 0){
                          consulta = consulta + ' AND Descripcion_L = ' + comilla + filtros.Fecha + comilla
                          console.log(consulta)
                        }else{
                          consulta = consulta + ' Descripcion_L = ' + comilla + filtros.Fecha + comilla
                          console.log(consulta)
                        }
                        counterAND = (counterAND)-(-1)
              }
                  
                  
              res.redirect('/Ofertante/Empleo/')
    
 
            }})

          
            
          

          /* let AND = "AND ID_SubRubro"
          console.log(AND)
          let solicitudes = await pool.query("SELECT * FROM solicitud WHERE ID_Solicitud IS NOT NULL ?" ,[AND +filtros.Rubro])
          let total = solicitudes.length    
                       
          let nombre = req.user.nombre
          let pagina = (req.params.page) */

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