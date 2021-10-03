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
          

          //OBTIENES LA PAGINA
          let page = ((req.params.page - 1 )*5)

          //HACES LA QUERY LIMITADA A 5 ELEMENTOS
          let solicitudes = await pool.query("SELECT * FROM solicitud LIMIT ?, ?;",[page,5]);
          let nombre = req.user.nombre
          let pagina = (req.params.page)

          //OBTIENES EL TOTAL DE QUERYS
          let total = await pool.query("SELECT * FROM solicitud");
          total = total.length

          //FILTRANDO SIRVE PARA SABER SI HICISTE CLICK EN EL BOTON FILTRAR
          let filtrando = 0
          

          //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
          let rubros = await(pool.query("SELECT Nombre FROM rubro"))

          //CARGAR EL RUBRO SELECCIONADO COMO VACIO (PORQUE TODAVIA NO HICIMOS CLICK EN FILTRAR)
          let rubroSeleccionado = 'vacio'
          let nivel ='vacio'
          
          //RENDERIZAMOS LA PAG
          res.render('empleoOfer.ejs',{
            solicitudes,nombre,pagina,total,filtrando,rubros,rubroSeleccionado,nivel

          })

  
          })


          router.post("/Ofertante/Empleo/Filter/:page",loggedIn, isOfertante, async (req, res) => {

            //OBTENEMOS LOS FILTROS QUE NOS MANDA EL FORM 
            let filtros = req.body;
            
                       
            //VARIABLES QUE VA A SERVIR PARA CONSTRUIR LA CONSULTA
            let consulta = 'SELECT * FROM solicitud WHERE '         
            let comilla = '"'
            let counterAND = 0




            //CHEQUEAMOS SI LOS FILTROS VIENEN VACIOS
            //SI VIENEN TODOS VACIOS SE REDIRECCIONA A LA PAGINA 1 
          if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio'){
            
            res.redirect('/Ofertante/Empleo/')
            
          }
            else {
            
              //SI TENEMOS FILTROS TENEMOS QUE VER CUALES TENEMOS
              


            
              if (filtros.Rubro != 'vacio'){

                // SI ENTRAMOS AQUI ES PORQUE TENEMOS SELECCIONADO UN RUBRO
                    //GUARDAMOS EL RUBRO PARA ENVIARLO AL HTML
                    rubroSeleccionado = filtros.Rubro
                  //OBTENEMOS EL ID DEL RUBRO XQ NOS VINO UN NOMBRE
                  

                  idRubro = await pool.query("SELECT ID_Rubro From rubro WHERE Nombre = ?",[rubroSeleccionado])
                  
                  consulta = consulta + ' ID_Rubro = ' + comilla + idRubro[0].ID_Rubro + comilla
                  console.log(consulta)
                  counterAND = (counterAND)-(-1)

                 
                 
                  //OBTENEMOS LOS SUBRUBROS DEL RUBRO SELECCIONADO PARA GENERAR LA LISTA
                  listaSubRubros = await pool.query("SELECT Nombre from subrubro WHERE ID_Rubro = '?'",[idRubro[0].ID_Rubro])
                  console.log(listaSubRubros)

              }else{
                rubroSeleccionado = 'vacio'
                listaSubRubros = 'vacio'
              }
               
              // CHEQUEO FILTRO FECHA
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


              //CHEQUEO DE SUBRUBRO
              if (filtros.SubRubro != 'vacio'){
                      
                subrubroSeleccionado = filtros.SubRubro

                  //OBTENEMOS ID SUBRUBRO PORQUE NOS VINO UN NOMBRE
                  idSubRubro = await pool.query("SELECT ID_SubRubro From subrubro WHERE Nombre = ?",[filtros.SubRubro])

                      if (counterAND != 0){
                        consulta = consulta + ' AND ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
                        console.log(consulta)
                      }else{
                        consulta = consulta + ' ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
                        console.log(consulta)
                      }
                      counterAND = (counterAND)-(-1)
                      //OBTENEMOS EL SUBRUBRO SELECCIONADO
                      

             }else{
              subrubroSeleccionado = 'vacio'
             }

              //CHEQUEO DE NIVEL DE EXPERIENCIA
              if (filtros.Experiencia != 'vacio'){
                        
                nivel = filtros.Experiencia
                      if (counterAND != 0){
                        consulta = consulta + ' AND Nivel = ' + comilla + filtros.Experiencia + comilla
                        console.log(consulta)
                      }else{
                        consulta = consulta + ' Nivel = ' + comilla + filtros.Experiencia + comilla
                        console.log(consulta)
                      }
                      counterAND = (counterAND)-(-1)
                      }else{
                        nivel = 'vacio'
                      }
                      
                      
                      //UNA VEZ AGREGADOS LOS RUBROS SE LE AGREGA EL LIMIT PARA PAGINACION
                      let consultaconlimit = consulta + ' LIMIT ?,?' 

                      let page = ((req.params.page - 1 )*5)
                      let solicitudes = await pool.query(consultaconlimit,[page,5])        
                      let nombre = req.body.nombre
                      let pagina = req.params.page


                      // PARA HACER SABER QUE HICIMOS CLICK EN FILTRAR
                      let filtrando = 1
                      

                     
                      //TOTAL DE ELEMENTOS DE LA CONSULTA
                      let total = await pool.query(consulta);
                      total = total.length

                      
                      //enviamos todos los rubros
                      let rubros = await(pool.query("SELECT Nombre FROM rubro"))

                     //RENDERIZAMOS
                      res.render('empleoOfer.ejs',{
                        solicitudes,nombre,pagina,total,consulta,filtrando,consultaconlimit,
                        rubroSeleccionado,listaSubRubros,rubros,subrubroSeleccionado,nivel
            
                      })
                      
      
                  }
                })










            router.get('/Ofertante/Empleo/Filter/:page/:query', loggedIn,isOfertante, async (req,res,next) =>{


              //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
              let rubros = await(pool.query("SELECT Nombre FROM rubro"))

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
              solicitudes,nombre,pagina,total,filtrando,consulta,rubros
  
            })
          
          })


          
            
        

module.exports = router;