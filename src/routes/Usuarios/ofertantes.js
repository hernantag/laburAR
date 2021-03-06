const express = require('express')
const router = express.Router()
const pool = require("../../database/database");
const path = require('path')
const { loggedIn, isOfertante, isSolicitante } = require('../../passport/helpers')



router.post('/oferta/eliminarPostulante', loggedIn, isOfertante, async(req, res, next) => {

  console.log(req.body.id,'asd')
  pool.query("DELETE from postulacion WHERE ID_Postulacion = ?", [req.body.id])
  
  res.redirect("/empleo/misOfertas/1")
})

router.post('/ofertante/subirportada',loggedIn,isOfertante,  async(req, res, next) => {


  if(!req.files){
  res.send('Selecciona un archivo')
   }else{
       
 imagen = req.files.imagen
 carpetita = path.join(__dirname + ('/uploads/portadas/'))

 console.log(carpetita)
      
      
    imagen.mv((carpetita +  req.user.idusuario +'.jpg'))
      pool.query("UPDATE usuario SET portada = ? WHERE idusuario = ?", [req.user.idusuario +'.jpg',req.user.idusuario])
      res.redirect('/ofertante/perfil')
      
   }
  
})

router.post('/ofertante/subirfoto',loggedIn,isOfertante,  async(req, res, next) => {


  if(!req.files){
  res.send('Selecciona un archivo')
   }else{
       
 imagen = req.files.imagen
 carpetita = path.join(__dirname + ('/uploads/'))

 console.log(carpetita)
      
      
    imagen.mv((carpetita +  req.user.idusuario +'.jpg'))
      pool.query("UPDATE usuario SET image = ? WHERE idusuario = ?", [req.user.idusuario +'.jpg',req.user.idusuario])
      res.redirect('/ofertante/perfil')
      
   }
  
})


router.get('/ofertante/perfil/editarPerfil', loggedIn, isOfertante, async(req, res, next) => {


  usuario = req.user 
  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
  
  res.render('EditarPerfilOf.ejs',{usuario,notis,tipo, ident})
})

router.post('/ofertante/perfil/editarPerfil', loggedIn, isOfertante, async(req, res, next) => {

  pool.query("UPDATE usuario SET biografia = ? , telefono = ? WHERE idusuario = ?", [req.body.bio,req.body.telefono,req.user.idusuario])
  
  res.redirect("/ofertante/perfil")
})


router.post('/oferta/eliminar/:idof', loggedIn, async (req,res) => {

  idof = req.params.idof
  pool.query("DELETE FROM oferta WHERE ID_Oferta = ?",[idof])
  pool.query("DELETE FROM postulacion WHERE ID_Oferta = ?",[idof])

  res.redirect('/Ofertante/Empleo/1')
})


router.get('/ofertante/perfil', loggedIn, isOfertante, async(req, res, next) => {


  usuario = req.user
  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
  res.render('perfilOfer.ejs',{usuario,notis,tipo,ident})
})

router.get('/Ofertante/Empleo', loggedIn, isOfertante, async (req, res, next) => {
  res.redirect('/Ofertante/Empleo/1')

})


router.get('/Ofertante/Empleo/:page', loggedIn, isOfertante, async (req, res, next) => {


  if (req.params.page < 1) {


    res.redirect('/Ofertante/Empleo')
    next()
  }


  //OBTIENES LA PAGINA
  let page = ((req.params.page - 1) * 5)

  //HACES LA QUERY LIMITADA A 5 ELEMENTOS
  let solicitudes = await pool.query("SELECT * FROM solicitud LIMIT ?, ?;", [page, 5]);
  let nombre = req.user.nombre
  let pagina = (req.params.page)

  //OBTIENES EL TOTAL DE QUERYS
  let total = await pool.query("SELECT * FROM solicitud");
  total = total.length

  //FILTRANDO SIRVE PARA SABER SI HICISTE CLICK EN EL BOTON FILTRAR
  let filtrando = 0


  //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
  let rubros = await (pool.query("SELECT Nombre FROM rubro"))

  //CARGAR EL RUBRO SELECCIONADO COMO VACIO (PORQUE TODAVIA NO HICIMOS CLICK EN FILTRAR)
  let rubroSeleccionado = 'vacio'
  let nivel = 'vacio'


  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
  //RENDERIZAMOS LA PAG
  res.render('empleoOfer.ejs', {
    notis,tipo,solicitudes, nombre, pagina, total, filtrando, rubros, rubroSeleccionado, nivel, ident

  })


})


router.post("/Ofertante/Empleo/Filter/:page", loggedIn, isOfertante, async (req, res) => {

  //OBTENEMOS LOS FILTROS QUE NOS MANDA EL FORM 
  let filtros = req.body;


  //VARIABLES QUE VA A SERVIR PARA CONSTRUIR LA CONSULTA
  let consulta = 'SELECT * FROM solicitud WHERE '
  let comilla = '"'
  let counterAND = 0




  //CHEQUEAMOS SI LOS FILTROS VIENEN VACIOS
  //SI VIENEN TODOS VACIOS SE REDIRECCIONA A LA PAGINA 1 
  if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio') {

    res.redirect('/Ofertante/Empleo/')

  }
  else {

    //SI TENEMOS FILTROS TENEMOS QUE VER CUALES TENEMOS




    if (filtros.Rubro != 'vacio') {

      // SI ENTRAMOS AQUI ES PORQUE TENEMOS SELECCIONADO UN RUBRO
      //GUARDAMOS EL RUBRO PARA ENVIARLO AL HTML
      rubroSeleccionado = filtros.Rubro
      //OBTENEMOS EL ID DEL RUBRO XQ NOS VINO UN NOMBRE


      idRubro = await pool.query("SELECT ID_Rubro From rubro WHERE Nombre = ?", [rubroSeleccionado])

      consulta = consulta + ' ID_Rubro = ' + comilla + idRubro[0].ID_Rubro + comilla
      console.log(consulta)
      counterAND = (counterAND) - (-1)



      //OBTENEMOS LOS SUBRUBROS DEL RUBRO SELECCIONADO PARA GENERAR LA LISTA
      listaSubRubros = await pool.query("SELECT Nombre from subrubro WHERE ID_Rubro = '?'", [idRubro[0].ID_Rubro])
      console.log(listaSubRubros)

    } else {
      rubroSeleccionado = 'vacio'
      listaSubRubros = 'vacio'
    }

    // CHEQUEO FILTRO FECHA
    if (filtros.Fecha != 'vacio') {



      if (counterAND != 0) {
        consulta = consulta + ' AND fecha_i = ' + comilla + filtros.Fecha + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' fecha_i = ' + comilla + filtros.Fecha + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
    }


    //CHEQUEO DE SUBRUBRO
    if (filtros.SubRubro != 'vacio') {

      subrubroSeleccionado = filtros.SubRubro

      //OBTENEMOS ID SUBRUBRO PORQUE NOS VINO UN NOMBRE
      idSubRubro = await pool.query("SELECT ID_SubRubro From subrubro WHERE Nombre = ?", [filtros.SubRubro])

      if (counterAND != 0) {
        consulta = consulta + ' AND ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
      //OBTENEMOS EL SUBRUBRO SELECCIONADO


    } else {
      subrubroSeleccionado = 'vacio'
    }

    //CHEQUEO DE NIVEL DE EXPERIENCIA
    if (filtros.Experiencia != 'vacio') {

      nivel = filtros.Experiencia
      if (counterAND != 0) {
        consulta = consulta + ' AND Nivel = ' + comilla + filtros.Experiencia + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' Nivel = ' + comilla + filtros.Experiencia + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
    } else {
      nivel = 'vacio'
    }


    //UNA VEZ AGREGADOS LOS RUBROS SE LE AGREGA EL LIMIT PARA PAGINACION
    let consultaconlimit = consulta + ' LIMIT ?,?'

    let page = ((req.params.page - 1) * 5)
    let solicitudes = await pool.query(consultaconlimit, [page, 5])

    let nombre = req.user.nombre
    let pagina = req.params.page


    // PARA HACER SABER QUE HICIMOS CLICK EN FILTRAR
    let filtrando = 1



    //TOTAL DE ELEMENTOS DE LA CONSULTA
    let total = await pool.query(consulta);
    total = total.length


    //enviamos todos los rubros
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))


    //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")

    //RENDERIZAMOS
    res.render('empleoOfer.ejs', {
      ident,notis,tipo,solicitudes, nombre, pagina, total, consulta, filtrando, consultaconlimit,
      rubroSeleccionado, listaSubRubros, rubros, subrubroSeleccionado, nivel

    })


  }
})










router.get('/Ofertante/Empleo/Filter/:page/:query', loggedIn, isOfertante, async (req, res, next) => {


  //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
  let rubros = await (pool.query("SELECT Nombre FROM rubro"))

  let consulta = req.params.query
  let consultaconlimit = consulta + ' LIMIT ?,?'

  if (req.params.page < 1) {


    res.redirect('/Ofertante/Empleo/1')
    next()
  }

  let page = ((req.params.page - 1) * 5)


  let solicitudes = await pool.query(consultaconlimit, [page, 5]);
  let nombre = req.user.nombre
  let pagina = (req.params.page)
  let total = await pool.query(consulta);
  total = total.length
  let filtrando = 1

  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")

  res.render('empleoOfer.ejs', {
    solicitudes, nombre, pagina, total, filtrando, consulta, rubros, notis, tipo, ident

  })

})



router.get('/empleo/agregarOferta', loggedIn, isOfertante, async (req, res) => {
  
  subrubros = await pool.query("SELECT Nombre,ID_Rubro,ID_SubRubro FROM subrubro")


  rubros = await pool.query("SELECT Nombre,ID_Rubro FROM rubro")
  
  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
  
  
  res.render('agregarOfer',{rubros,subrubros,ident,notis,tipo})
})


router.post('/empleo/agregarOferta', loggedIn, isOfertante, async (req, res) => {
  
  let fechai = new Date();
  let fechaf = new Date();
  fechaf.setDate(fechaf.getDate() + 45)

  await pool.query("INSERT INTO oferta (Titulo,Descripcion,Imagen,idusuario,ID_Rubro,ID_SubRubro,Nivel,fecha_i,fecha_f) VALUES (?,?,0,?,?,?,?,?,?)",[req.body.titulo,req.body.descripcion,req.user.idusuario,req.body.rubro,req.body.subrubro,req.body.nivel,fechai,fechaf])
  await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,Now(),?,?)",[2,req.user.idusuario,false])
  res.redirect('/empleo/misOfertas/1')
})

router.post('/ofertante/verificarse',loggedIn,isOfertante,  async(req, res, next) => {


  if(!req.files){
  res.send('Selecciona un archivo')
   }else{
       
    fotoDNI = req.files.fotoDNI
 carpetita = path.join(__dirname + ('/uploads/verificaciones/'))

 console.log(carpetita)
      
      
 fotoDNI.mv((carpetita +  req.user.idusuario +'.jpg'))
      pool.query("UPDATE usuario SET imgver = ? WHERE idusuario = ?", [req.user.idusuario +'.jpg',req.user.idusuario])
      pool.query("UPDATE usuario SET verificado = 'proceso' WHERE idusuario = ?", [req.user.idusuario])
      res.redirect('/ofertante/perfil')
      
   }
  
})


router.get('/empleo/misOfertas/:page', loggedIn, isOfertante, async (req, res, next) => {

  if (req.params.page < 1) {


    res.redirect('/empleo/misOfertas/1')
    next()
  }


  //OBTIENES LA PAGINA
  let page = ((req.params.page - 1) * 5)

  //HACES LA QUERY LIMITADA A 5 ELEMENTOS
  let ofertas = await pool.query("SELECT * FROM oferta WHERE idusuario = ? LIMIT ?, ?;", [req.user.idusuario, page, 5]);
  let nombre = req.user.nombre
  let pagina = (req.params.page)

  //OBTIENES EL TOTAL DE QUERYS
  let total = await pool.query("SELECT * FROM oferta WHERE idusuario = ?", [req.user.idusuario]);
  total = total.length

  //FILTRANDO SIRVE PARA SABER SI HICISTE CLICK EN EL BOTON FILTRAR
  let filtrando = 0


  //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
  let rubros = await (pool.query("SELECT Nombre FROM rubro"))

  //CARGAR EL RUBRO SELECCIONADO COMO VACIO (PORQUE TODAVIA NO HICIMOS CLICK EN FILTRAR)
  let rubroSeleccionado = 'vacio'
  let nivel = 'vacio'

  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")

  //RENDERIZAMOS LA PAG
  res.render('MisOfertas.ejs', {
    ident, notis, tipo,ofertas, nombre, pagina, total, filtrando, rubros, rubroSeleccionado, nivel

  })
})

router.get('/empleos/misOfertas', loggedIn, isOfertante, async (req, res, next) => {
  res.redirect('(empleos/misOfertas/1')
})




router.post("/empleo/misOfertas/:page", loggedIn, isOfertante, async (req, res, next) => {

  //OBTENEMOS LOS FILTROS QUE NOS MANDA EL FORM 
  let filtros = req.body;


  //VARIABLES QUE VA A SERVIR PARA CONSTRUIR LA CONSULTA


  let consulta = 'SELECT * FROM oferta WHERE '
  let comilla = '"'
  let counterAND = 0




  //CHEQUEAMOS SI LOS FILTROS VIENEN VACIOS
  //SI VIENEN TODOS VACIOS SE REDIRECCIONA A LA PAGINA 1 
  if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio') {

    res.redirect('/empleo/misOfertas/1')

  }


  else {


    //SI TENEMOS FILTROS TENEMOS QUE VER CUALES TENEMOS




    if (filtros.Rubro != 'vacio') {

      // SI ENTRAMOS AQUI ES PORQUE TENEMOS SELECCIONADO UN RUBRO
      //GUARDAMOS EL RUBRO PARA ENVIARLO AL HTML
      rubroSeleccionado = filtros.Rubro
      //OBTENEMOS EL ID DEL RUBRO XQ NOS VINO UN NOMBRE


      idRubro = await pool.query("SELECT ID_Rubro From rubro WHERE Nombre = ?", [rubroSeleccionado])

      consulta = consulta + ' ID_Rubro = ' + comilla + idRubro[0].ID_Rubro + comilla
      console.log(consulta)
      counterAND = (counterAND) - (-1)



      //OBTENEMOS LOS SUBRUBROS DEL RUBRO SELECCIONADO PARA GENERAR LA LISTA
      listaSubRubros = await pool.query("SELECT Nombre from subrubro WHERE ID_Rubro = '?'", [idRubro[0].ID_Rubro])
      console.log(listaSubRubros)

    } else {
      rubroSeleccionado = 'vacio'
      listaSubRubros = 'vacio'
    }

    // CHEQUEO FILTRO FECHA
    if (filtros.Fecha != 'vacio') {



      if (counterAND != 0) {
        consulta = consulta + ' AND fecha_i = ' + comilla + filtros.Fecha + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' fecha_i = ' + comilla + filtros.Fecha + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
    }


    //CHEQUEO DE SUBRUBRO
    if (filtros.SubRubro != 'vacio') {

      subrubroSeleccionado = filtros.SubRubro

      //OBTENEMOS ID SUBRUBRO PORQUE NOS VINO UN NOMBRE
      idSubRubro = await pool.query("SELECT ID_SubRubro From subrubro WHERE Nombre = ?", [filtros.SubRubro])

      if (counterAND != 0) {
        consulta = consulta + ' AND ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' ID_SubRubro = ' + comilla + idSubRubro[0].ID_SubRubro + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
      //OBTENEMOS EL SUBRUBRO SELECCIONADO


    } else {
      subrubroSeleccionado = 'vacio'
    }

    //CHEQUEO DE NIVEL DE EXPERIENCIA
    if (filtros.Experiencia != 'vacio') {

      nivel = filtros.Experiencia
      if (counterAND != 0) {
        consulta = consulta + ' AND Nivel = ' + comilla + filtros.Experiencia + comilla
        console.log(consulta)
      } else {
        consulta = consulta + ' Nivel = ' + comilla + filtros.Experiencia + comilla
        console.log(consulta)
      }
      counterAND = (counterAND) - (-1)
    } else {
      nivel = 'vacio'
    }


    //UNA VEZ AGREGADOS LOS RUBROS SE LE AGREGA EL LIMIT PARA PAGINACION

    consulta = consulta + 'AND idusuario = ' + req.user.idusuario

    let consultaconlimit = consulta + ' LIMIT ?,?'

    let page = ((req.params.page - 1) * 5)
    let ofertas = await pool.query(consultaconlimit, [page, 5])
    let nombre = req.user.nombre
    let pagina = req.params.page


    // PARA HACER SABER QUE HICIMOS CLICK EN FILTRAR
    let filtrando = 1



    //TOTAL DE ELEMENTOS DE LA CONSULTA
    let total = await pool.query(consulta);
    total = total.length


    //enviamos todos los rubros
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))

    //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
    //RENDERIZAMOS
    res.render('MisOfertas.ejs', {
      ident,notis,tipo,ofertas, nombre, pagina, total, consulta, filtrando, consultaconlimit,
      rubroSeleccionado, listaSubRubros, rubros, subrubroSeleccionado, nivel

    })


  }
})



router.get('/empleo/misOfertas/Filter/:page/:query', loggedIn, isOfertante, async (req, res, next) => {


  //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
  let rubros = await (pool.query("SELECT Nombre FROM rubro"))

  let consulta = req.params.query
  let consultaconlimit = consulta + ' LIMIT ?,?'

  if (req.params.page < 1) {


    res.redirect('/empleo/misOfertas/1')
    next()
  }

  let page = ((req.params.page - 1) * 5)


  let ofertas = await pool.query(consultaconlimit, [page, 5]);
  let nombre = req.user.nombre
  let pagina = (req.params.page)
  let total = await pool.query(consulta);
  total = total.length
  let filtrando = 1

  //NOTIFICACIONES
  ident = req.user
  notis = await pool.query("SELECT * FROM notificacion WHERE idusuario = ?", [req.user.idusuario])
  tipo = await pool.query("SELECT * FROM tipo")
  res.render('misOfertas.ejs', {
    ident,tipo,notis,ofertas, nombre, pagina, total, filtrando, consulta, rubros

  })

})
router.post('/ofertante/renovar/tiempo/:id', loggedIn, isOfertante, async (req, res) => {
  id = req.params.id
  let fechai = new Date();
  let fechaf = new Date();
  fechaf.setDate(fechaf.getDate() + 200)

  await pool.query("UPDATE oferta SET fecha_i = ?, fecha_f = ? WHERE ID_Oferta = ?",[fechai,fechaf,id])
  res.redirect('/empleo/misOfertas/1')
})

module.exports = router;