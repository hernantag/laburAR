const express = require('express')
const pool = require("../../database/database")
const router = express.Router()
const {loggedIn,isAdmin} = require('../../passport/helpers')




router.get('/inicio/Admin', loggedIn,isAdmin,  async (req,res,next) =>{
    let usuarios = await pool.query("SELECT * FROM usuario");
    let rubros = await pool.query("SELECT * FROM rubro");
    let subrubros = await pool.query("SELECT * FROM subrubro");
    //console.log(usuarios)
    res.render('inicioAdmin.ejs', {usuarios,rubros,subrubros})
})

router.post('/admin/agregar/usuario', loggedIn,isAdmin,  async(req,res,next)=>{
    let usuario = req.body
    let nombre = usuario.nombre
    let apellido = usuario.apellido
    let correo = usuario.correo
    let DNI = usuario.DNI
    let contraseña = usuario.contraseña
    let tipo = usuario.tipo
    let fecha = usuario.fecha
    console.log("Pase por aca")
    console.log(usuario)
    console.log(tipo)
    await pool.query("INSERT INTO usuario ( nombre, apellido, correo, DNI, contraseña, tipo, fecha) VALUES (?,?,?,?,?,?,?) ",[nombre,apellido,correo,DNI,contraseña,tipo,fecha])
    console.log("Pase por aca tambien")
    res.redirect('/inicio/Admin')
})
router.post('/admin/eliminar/usuario', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    await pool.query("DELETE FROM usuario WHERE idusuario = ?",[id])
    res.redirect('/inicio/Admin')
})
router.post('/admin/verificar/usuario', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    let usuario = await pool.query("SELECT * FROM usuario WHERE idusuario = ?",[id])
    console.log(usuario)
    res.render('verificarAdmin.ejs',{usuario})
})





router.post('/admin/usuario/verificado', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    let verificado = req.body.verificado
    let fecha = new Date()
    console.log(verificado,id)
    await pool.query("UPDATE usuario SET verificado = ? WHERE idusuario = ?", [verificado,id])
    if(verificado == "si"){
        await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[6,fecha,id,false])
    }else{
        await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[3,fecha,id,false])
    }
    
    //await pool.query("DELETE FROM usuario WHERE idusuario = ?",[id])
    res.redirect('/inicio/Admin')
})




router.post('/admin/agregar/rubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let rubro = req.body
    await pool.query("INSERT INTO rubro (Nombre) VALUES (?)",[rubro.Nombre])
    res.redirect('/inicio/Admin')
})

router.post('/admin/eliminar/rubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    await pool.query("DELETE FROM rubro WHERE ID_Rubro = ?",[id])
    await pool.query("DELETE FROM subrubro WHERE ID_Rubro = ?",[id])
    res.redirect('/inicio/Admin')
})
router.post('/admin/agregar/subrubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let rubro = req.body
    await pool.query("INSERT INTO subrubro (ID_Rubro, Nombre) VALUES (?,?)",[rubro.ID_Rubro,rubro.Nombre])
    res.redirect('/inicio/Admin')
})
router.post('/admin/eliminar/subrubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    await pool.query("DELETE FROM subrubro WHERE ID_SubRubro = ?",[id])
    res.redirect('/inicio/Admin')
})
router.post('/admin/actualizacion', loggedIn,isAdmin,  async(req,res,next)=>{
    let hoy = new Date();
    let mañana = new Date()
    mañana.setDate(mañana.getDate() + 5)
    let ofertas = await pool.query("SELECT * FROM oferta WHERE DATE(fecha_f) BETWEEN DATE(?) AND DATE(?)", [hoy,mañana])
    console.log(ofertas)
    for (let index = 0; index < ofertas.length; index++) {
        const element = ofertas[index]
        
        if (element.fecha_f.getDate() == hoy.getDate()) {
            console.log(element.fecha_f.getDate(), hoy.getDate())
            console.log("llegoche")
            await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[7,hoy,element.idusuario,false])
            await pool.query("DELETE FROM oferta WHERE idusuario = ? AND fecha_f = DATE(?)", [element.idusuario,hoy])
        }else{
            console.log(element.fecha_f.getDate(), hoy.getDate())
            console.log("llegoche2")
            await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[4,hoy,element.idusuario,false])
        }
        
    }
    let solicitudes = await pool.query("SELECT * FROM solicitud WHERE DATE(fecha_f) BETWEEN DATE(?) AND DATE(?)", [hoy,mañana])
    console.log(solicitudes)
    for (let index = 0; index < solicitudes.length; index++) {
        const element = solicitudes[index]
        
        if (element.fecha_f.getDate() == hoy.getDate()) {
            console.log(element.fecha_f.getDate(), hoy.getDate())
            console.log("llegoche")
            await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[8,hoy,element.idusuario,false])
            await pool.query("DELETE FROM solicitud WHERE idusuario = ? AND fecha_f = DATE(?)", [element.idusuario,hoy])
        }else{
            console.log(element.fecha_f.getDate(), hoy.getDate())
            console.log("llegoche2")
            await pool.query("INSERT INTO notificacion( ID_Tipo, Fecha, idusuario, visto) VALUES (?,?,?,?)",[5,hoy,element.idusuario,false])
        }
        
    }
    
    res.redirect('/inicio/Admin')
})



module.exports = router