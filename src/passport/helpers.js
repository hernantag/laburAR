const helpers = {};


helpers.loggedIn = (req, res, next)=>{

    if (req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/signin")
    }
}

helpers.isOfertante = (req, res, next)=>{

    if (req.user.tipo == "ofertante"){
        return next()
    }else{
        res.redirect("/")
    }
}
helpers.isSolicitante = (req, res, next)=>{

    if (req.user.tipo == "solicitante"){
        return next()
    }else{
        res.redirect("/")
    }
}
helpers.isAdmin = (req, res, next)=>{

    if (req.user.tipo == "admin"){
        return next()
    }else{
        res.redirect("/")
    }
}



module.exports = helpers