const express = require('express')
const pool = require("../../database/database");
const router = express.Router()
const {loggedIn,isAdmin} = require('../../passport/helpers')




router.get('/inicio/Admin', loggedIn,isAdmin,  async (req,res,next) =>{
    let usuarios = await pool.query("SELECT * FROM usuario");
    let rubros = await pool.query("SELECT * FROM rubro");
    let subrubros = await pool.query("SELECT * FROM subrubro");
    console.log(usuarios)
    res.render('inicioAdmin.ejs', {usuarios,rubros,subrubros})
})

router.post('/admin/agregar/usuario', isAdmin,  async(req,res,next)=>{
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
    await pool.query("INSERT INTO usuario ( nombre, apellido, correo, DNI, contraseña, tipo, fecha) VALUES (?,?,?,?,?,?,?) "[nombre,apellido,correo,DNI,contraseña,tipo,fecha])
    console.log("Pase por aca tambien")
    res.redirect('/inicio/Admin')
})

module.exports = router;