const passport = require("passport");
const localStrategy = require('passport-local').Strategy
const pool = require("../database/database");


passport.serializeUser((user, done) => {
    return done(null, user.idusuario);
  });
  
  passport.deserializeUser(async (id, done) => {
    const fila = await pool.query("SELECT * FROM usuario WHERE idusuario = ?", [
      id
    ]);
    return done(null, fila[0]);
  });
  

passport.use('local-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
},async (req,email,password,done) =>
{

    console.log(req.body);
    const verificarExistencia = await pool.query(
      "SELECT * FROM usuario where correo = ?",
      [email]
    );

    console.log(verificarExistencia);

    if (verificarExistencia.lenght > 0) {
      return done(
        null,
        false,
        console.log('usuario ya registrado')
      );
    }

    console.log(req.body)


    const { nombre,apellido,DNI, tipo,fecha } = req.body;

    let nuevoUsuario = {
      DNI,
      correo: req.body.email,
      contraseña: req.body.password,
      tipo,
      nombre,
      apellido,
      fecha
    };

    const resultado = await pool.query("INSERT INTO usuario SET ?", [
      nuevoUsuario
    ]);

    nuevoUsuario.idusuario = resultado.insertId;
    return done(null, nuevoUsuario);
}))

passport.use('local-signin',new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
},async (req,email,password,done) =>{

console.log(req.body);
const user = await pool.query('SELECT * FROM usuario WHERE correo = ?', [email] )


if (!user){
    return done(
        null,
        false,
        console.log('el email no se encuentra registrado'))
}else{
      
        
        if (user[0].contraseña != req.body.password){
            
            return done(null,false,console.log('contraseña incorrecta'))
        }else{
            return done(null, user[0]);
        }

}

}
)


)