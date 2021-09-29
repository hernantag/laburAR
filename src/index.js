const { urlencoded } = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const app = express()
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
require("./passport/local-auth");

//settings
app.set('port',3000)
app.set('view engine','ejs')
app.set("views", path.join(__dirname, "views"));

//MIDDLEWARES
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

//ROUTER
app.use(require('./routes/routesmain'))


//SERVER LISTENING
app.listen(app.get('port'), ()=>{
    console.log('Server listening on port',app.get('port'))
})
