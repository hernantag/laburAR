const express = require('express')
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
          let filtrando = 0
          


          let rubros = await(pool.query("SELECT Nombre FROM rubro"))
          let rubroSeleccionado = 'vacio'
          console.log(rubros)

          res.render('empleoOfer.ejs',{
            solicitudes,nombre,pagina,total,filtrando,rubros,rubroSeleccionado

          })

  
          })


          router.post("/Ofertante/Empleo/Filter/:page",loggedIn, isOfertante, async (req, res) => {

            
            let filtros = req.body;
            console.log(filtros)
                       

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
            console.log(filtros)
              if (filtros.Rubro != 'vacio'){

                  consulta = consulta + ' ID_Rubro = ' + comilla + filtros.Rubro + comilla
                  console.log(consulta)
                  counterAND = (counterAND)-(-1)

                  rubroSeleccionado = filtros.Rubro
                  


              }
                //para agregar and

              if (filtros.Fecha != 'vacio'){
                
                        if (counterAND != 0){
                          consulta = consulta + ' AND fecha_i = ' + comilla + filtros.Fecha + comilla
                          console.log(consulta)
                        }else{
                          consulta = consulta + ' fecha_i = ' + comilla + filtros.Fecha + comilla
                          console.log(consulta)
                        }
                        counterAND = (counterAND)-(-1)
              }

              if (filtros.SubRubro != 'vacio'){
                      
                      if (counterAND != 0){
                        consulta = consulta + ' AND ID_SubRubro = ' + comilla + filtros.SubRubro + comilla
                        console.log(consulta)
                      }else{
                        consulta = consulta + ' ID_SubRubro = ' + comilla + filtros.SubRubro + comilla
                        console.log(consulta)
                      }
                      counterAND = (counterAND)-(-1)
                     

             }

              if (filtros.Experiencia != 'vacio'){
                        
                      if (counterAND != 0){
                        consulta = consulta + ' AND Nivel = ' + comilla + filtros.Experiencia + comilla
                        console.log(consulta)
                      }else{
                        consulta = consulta + ' Nivel = ' + comilla + filtros.Experiencia + comilla
                        console.log(consulta)
                      }
                      counterAND = (counterAND)-(-1)
                      }
                          
                      let consultaconlimit = consulta + ' LIMIT ?,?' 

                      let page = ((req.params.page - 1 )*5)
                      let solicitudes = await pool.query(consultaconlimit,[page,5])        
                      let nombre = req.body.nombre
                      let pagina = req.params.page
                      let filtrando = 1
                      

                     

                      let total = await pool.query(consulta);
                      total = total.length

                      


                     
                      res.render('empleoOfer.ejs',{
                        solicitudes,nombre,pagina,total,consulta,filtrando,consultaconlimit,rubroSeleccionado
            
                      })
                      
      
                  }
                })










            router.get('/Ofertante/Empleo/Filter/:page/:query', loggedIn,isOfertante, async (req,res,next) =>{

              let consulta = req.params.query
              let consultaconlimit = consulta + ' LIMIT ?,?' 

              if (req.params.page < 1){
                      
                      
                res.redirect('/Ofertante/Empleo/1')
              next()
              }
            
            let page = ((req.params.page - 1 )*5)


            let solicitudes = await pool.query(consultaconlimit,[page,5]);
            let nombre = req.user.nombre
            let pagina = (req.params.page)
            let total = await pool.query(consulta);
            total = total.length
            let filtrando = 1

            res.render('empleoOfer.ejs',{
              solicitudes,nombre,pagina,total,filtrando,consulta
  
            })
          
          })


          
            
          

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