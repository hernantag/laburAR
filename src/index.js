const { urlencoded } = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const app = express()
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
const fuP = require('express-fileupload')

require("./passport/local-auth");

//settings
app.set('port',3000)
app.set('view engine','ejs')
app.set("views", path.join(__dirname, "views"));

//MIDDLEWARES

app.use(fuP())

app.use(morgan('dev'))
app.use(urlencoded({extended:false}))
app.use(session({
    secret:'secreto',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())



//STATIC FILES
 
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/routes/Usuarios/uploads"));

//ROUTER
app.use(require('./routes/routesmain'))
app.use(require('./routes/Usuarios/ofertantes'))
app.use(require('./routes/Usuarios/Solicitantes'))
app.use(require('./routes/Usuarios/admin'))

//SERVER LISTENING
app.listen(app.get('port'), ()=>{
    console.log('Server listening on port',app.get('port'))
})
