const { Router } = require('express');
const express = require('express')
const pool = require("../../database/database");
const router = express.Router()
const {loggedIn,isSolicitante, isOfertante} = require('../../passport/helpers')




router.post('/oferta/postularse/:id', loggedIn,isSolicitante, async (req,res) => {

  idof = req.params.id
  Descripcion = req.body.Descripcion
  idus = req.user.idusuario

  pool.query("INSERT INTO postulacion (Descripcion,idusuario,ID_Oferta) VALUES (?,?,?)",[Descripcion,idus,idof] )
  

  res.redirect('/solicitante/empleo/1')
})

router.post('/solicitud/eliminar/:idsol', loggedIn, async (req,res) => {

  idsol = req.params.idsol
  pool.query("DELETE FROM solicitud WHERE ID_Solicitud = ?",[idsol])
  

  res.redirect('/solicitante/empleo/1')
})


router.get('/perfil/:id', loggedIn, async (req, res, next) => {

  iduser = req.params.id
  usuario = await pool.query("SELECT * FROM usuario WHERE idusuario = ?",[iduser])
  
  res.render('perfilSoliMod.ejs',usuario)
})



router.get('/empleo/solicitud/:id', loggedIn, async (req,res,next) =>{

  idofer = req.params.id
  
  oferta = await pool.query("SELECT * FROM solicitud WHERE ID_Solicitud = ?",[idofer])
  usuario = await pool.query("SELECT * FROM usuario WHERE idusuario = ?",[oferta[0].idusuario])
  rubro = await pool.query("SELECT Nombre FROM rubro WHERE ID_Rubro = ?",[oferta[0].ID_Rubro])
  console.log(oferta[0].ID_SubRubro)
  subrubro = await pool.query("SELECT Nombre FROM subrubro WHERE ID_SubRubro = ?",[oferta[0].ID_SubRubro])
  usuariologueado = req.user

  res.render('solicitud.ejs',{oferta,usuario,rubro,subrubro,usuariologueado})
})


router.get('/empleo/oferta/:id', loggedIn, async (req,res,next) =>{

  idofer = req.params.id
  
  oferta = await pool.query("SELECT * FROM oferta WHERE ID_Oferta = ?",[idofer])
  usuario = await pool.query("SELECT * FROM usuario WHERE idusuario = ?",[oferta[0].idusuario])
  rubro = await pool.query("SELECT Nombre FROM rubro WHERE ID_Rubro = ?",[oferta[0].ID_Rubro])
  subrubro = await pool.query("SELECT Nombre FROM subrubro WHERE ID_SubRubro = ?",[oferta[0].ID_SubRubro])
  usuariologueado = req.user
  postulaciones = await pool.query("SELECT * FROM postulacion p JOIN usuario o ON p.idusuario = o.idusuario WHERE ID_Oferta = ?",[oferta[0].ID_Oferta])
  

  res.render('oferta.ejs',{oferta,usuario,rubro,subrubro,usuariologueado,postulaciones})
})

router.get('/solicitante/empleo', loggedIn,isSolicitante,  (req,res,next) =>{
    res.redirect('/solicitante/empleo/1')
})


router.get('/solicitante/empleo/:page', loggedIn, isSolicitante, async (req, res, next) => {


    if (req.params.page < 1) {
  
  
      res.redirect('/solicitante/empleo')
      next()
    }
  
  
    //OBTIENES LA PAGINA
    let page = ((req.params.page - 1) * 5)
  
    //HACES LA QUERY LIMITADA A 5 ELEMENTOS
    let ofertas = await pool.query("SELECT * FROM oferta LIMIT ?, ?;", [page, 5]);
    let nombre = req.user.nombre
    let pagina = (req.params.page)
  
    //OBTIENES EL TOTAL DE QUERYS
    let total = await pool.query("SELECT * FROM oferta");
    total = total.length
  
    //FILTRANDO SIRVE PARA SABER SI HICISTE CLICK EN EL BOTON FILTRAR
    let filtrando = 0
  
  
    //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))
  
    //CARGAR EL RUBRO SELECCIONADO COMO VACIO (PORQUE TODAVIA NO HICIMOS CLICK EN FILTRAR)
    let rubroSeleccionado = 'vacio'
    let nivel = 'vacio'
  
    //RENDERIZAMOS LA PAG
    res.render('empleoSoli.ejs', {
        ofertas, nombre, pagina, total, filtrando, rubros, rubroSeleccionado, nivel
  
    })
  
  
  })

  router.post("/solicitante/empleo/Filter/:page", loggedIn, isSolicitante, async (req, res) => {

    //OBTENEMOS LOS FILTROS QUE NOS MANDA EL FORM 
    let filtros = req.body;
  
  
    //VARIABLES QUE VA A SERVIR PARA CONSTRUIR LA CONSULTA
    let consulta = 'SELECT * FROM oferta WHERE '
    let comilla = '"'
    let counterAND = 0
  
  
  
  
    //CHEQUEAMOS SI LOS FILTROS VIENEN VACIOS
    //SI VIENEN TODOS VACIOS SE REDIRECCIONA A LA PAGINA 1 
    if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio') {
  
      res.redirect('/solicitante/empleo/')
  
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
  
      //RENDERIZAMOS
      res.render('empleoSoli.ejs', {
        ofertas, nombre, pagina, total, consulta, filtrando, consultaconlimit,
        rubroSeleccionado, listaSubRubros, rubros, subrubroSeleccionado, nivel
  
      })
  
  
    }
  })

  router.get('/solicitante/empleo/Filter/:page/:query', loggedIn, isSolicitante, async (req, res, next) => {


    //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))
  
    let consulta = req.params.query
    let consultaconlimit = consulta + ' LIMIT ?,?'
  
    if (req.params.page < 1) {
  
  
      res.redirect('/solicitante/empleo/1')
      next()
    }
  
    let page = ((req.params.page - 1) * 5)
  
  
    let ofertas = await pool.query(consultaconlimit, [page, 5]);
    let nombre = req.user.nombre
    let pagina = (req.params.page)
    let total = await pool.query(consulta);
    total = total.length
    let filtrando = 1
  
    res.render('empleoSoli.ejs', {
      ofertas, nombre, pagina, total, filtrando, consulta, rubros
  
    })
  
  })

  router.get('/solicitante/perfil', loggedIn, isSolicitante, (req, res, next) => {


    usuario = req.user
    res.render('perfilSoli.ejs',usuario)
  })
  
  router.get('/empleo/agregarSolicitud', loggedIn, isSolicitante, async (req, res, next) => {
    subrubros = await pool.query("SELECT Nombre,ID_Rubro,ID_SubRubro FROM subrubro")


    rubros = await pool.query("SELECT Nombre,ID_Rubro FROM rubro")

    usuario = req.user
    res.render('agregarSoli.ejs',{subrubros,rubros})
  })

  router.post('/empleo/agregarSolicitud', loggedIn, isSolicitante, async (req, res) => {
    
    let fechai = new Date();
    let fechaf = new Date();
    fechaf.setDate(fechaf.getDate() + 90)

    await pool.query("INSERT INTO solicitud (Titulo,Descripcion,Imagen,idusuario,ID_Rubro,ID_SubRubro,Nivel,fecha_i,fecha_f) VALUES (?,?,0,?,?,?,?,?,?)",[req.body.titulo,req.body.descripcion,req.user.idusuario,req.body.rubro,req.body.subrubro,req.body.nivel,fechai,fechaf])
    res.redirect('/empleo/misSolicitudes/1')
  })
  

  router.get('/empleo/misSolicitudes/:page', loggedIn, isSolicitante, async (req, res, next) => {

    if (req.params.page < 1) {
  
  
      res.redirect('/empleo/misSolicitudes/1')
      next()
    }
  
  
    //OBTIENES LA PAGINA
    let page = ((req.params.page - 1) * 5)
  
    //HACES LA QUERY LIMITADA A 5 ELEMENTOS
    let solicitudes = await pool.query("SELECT * FROM solicitud WHERE idusuario = ? LIMIT ?, ?;", [req.user.idusuario, page, 5]);
    let nombre = req.user.nombre
    let pagina = (req.params.page)
  
    //OBTIENES EL TOTAL DE QUERYS
    let total = await pool.query("SELECT * FROM solicitud WHERE idusuario = ?", [req.user.idusuario]);
    total = total.length
  
    //FILTRANDO SIRVE PARA SABER SI HICISTE CLICK EN EL BOTON FILTRAR
    let filtrando = 0
  
  
    //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))
  
    //CARGAR EL RUBRO SELECCIONADO COMO VACIO (PORQUE TODAVIA NO HICIMOS CLICK EN FILTRAR)
    let rubroSeleccionado = 'vacio'
    let nivel = 'vacio'
  
    //RENDERIZAMOS LA PAG
    res.render('MisSolicitudes.ejs', {
      solicitudes, nombre, pagina, total, filtrando, rubros, rubroSeleccionado, nivel
  
    })
  })
  
  router.get('/empleo/misSolicitudes', loggedIn, isSolicitante, async (req, res, next) => {
    res.redirect('/empleo/misSolicitudes/1')
  })


  router.post("/empleo/misSolicitudes/:page", loggedIn, isSolicitante, async (req, res, next) => {

    //OBTENEMOS LOS FILTROS QUE NOS MANDA EL FORM 
    let filtros = req.body;
  
  
    //VARIABLES QUE VA A SERVIR PARA CONSTRUIR LA CONSULTA
  
  
    let consulta = 'SELECT * FROM solicitud WHERE '
    let comilla = '"'
    let counterAND = 0
  
  
  
  
    //CHEQUEAMOS SI LOS FILTROS VIENEN VACIOS
    //SI VIENEN TODOS VACIOS SE REDIRECCIONA A LA PAGINA 1 
    if (filtros.Rubro === 'vacio' && filtros.SubRubro === 'vacio' && filtros.Experiencia === 'vacio' && filtros.Fecha === 'vacio') {
  
      res.redirect('/empleo/misSolicitudes/1')
  
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
  
      //RENDERIZAMOS
      res.render('MisSolicitudes.ejs', {
        solicitudes, nombre, pagina, total, consulta, filtrando, consultaconlimit,
        rubroSeleccionado, listaSubRubros, rubros, subrubroSeleccionado, nivel
  
      })
  
  
    }
  })

  router.get('/empleo/misSolicitudes/Filter/:page/:query', loggedIn, isSolicitante, async (req, res, next) => {


    //OBTIENES TODOS LOS RUBROS PARA CARGARLOS EN EL COMBOBOX
    let rubros = await (pool.query("SELECT Nombre FROM rubro"))
  
    let consulta = req.params.query
    let consultaconlimit = consulta + ' LIMIT ?,?'
  
    if (req.params.page < 1) {
  
  
      res.redirect('/empleo/misSolicitudes/1')
      next()
    }
  
    let page = ((req.params.page - 1) * 5)
  
  
    let solicitudes = await pool.query(consultaconlimit, [page, 5]);
    let nombre = req.user.nombre
    let pagina = (req.params.page)
    let total = await pool.query(consulta);
    total = total.length
    let filtrando = 1
  
    res.render('MisSolicitudes.ejs', {
      solicitudes, nombre, pagina, total, filtrando, consulta, rubros
  
    })
  
  })
  
module.exports = router;