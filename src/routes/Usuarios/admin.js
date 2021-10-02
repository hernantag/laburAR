const express = require('express')
const pool = require("../../database/database")
const router = express.Router()
const {loggedIn,isAdmin} = require('../../passport/helpers')




router.get('/inicio/Admin', loggedIn,isAdmin,  async (req,res,next) =>{
    let usuarios = await pool.query("SELECT * FROM usuario");
    let rubros = await pool.query("SELECT * FROM rubro");
    let subrubros = await pool.query("SELECT * FROM subrubro");
    console.log(usuarios)
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

router.post('/admin/agregar/rubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let rubro = req.body
    await pool.query("INSERT INTO rubro (Nombre, Descripcion) VALUES (?,?)",[rubro.Nombre,rubro.Descripcion])
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
    await pool.query("INSERT INTO subrubro (ID_Rubro, Nombre, Descripcion) VALUES (?,?,?)",[rubro.ID_Rubro,rubro.Nombre,rubro.Descripcion])
    res.redirect('/inicio/Admin')
})
router.post('/admin/eliminar/subrubro', loggedIn,isAdmin,  async(req,res,next)=>{
    let id = req.body.id
    await pool.query("DELETE FROM subrubro WHERE ID_SubRubro = ?",[id])
    res.redirect('/inicio/Admin')
})

module.exports = router