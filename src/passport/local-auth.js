const passport = require("passport");
const localStrategy = require('passport-local').Strategy
const pool = require("../database/database");


passport.serializeUser((user, done) => {
    return done(null, user.idusuario);
  });
  
  passport.deserializeUser(async (id, done) => {
    const fila = await pool.query("SELECT * FROM usuarios WHERE idusuario = ?", [
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
      "SELECT * FROM usuarios where email = ?",
      [email]
    );

    console.log(verificarExistencia);

    if (verificarExistencia) {
      return done(
        null,
        false,
        console.log('usuario ya registrado')
      );
    }

    console.log(req.body)
    const { nombre } = req.body;
    let nuevoUsuario = {
      email,
      nombre,
      contraseña: req.body.password,
    };

    const resultado = await pool.query("INSERT INTO usuarios SET ?", [
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
const user = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email] )


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