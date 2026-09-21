const jwt=require("jsonwebtoken");
const env=require("../config/env");
const User=require("../models/User");
const ApiError=require("../utils/apiError");

async function authenticate(req,res,next){
    try{
        const h=req.headers.authorization||"";
        const token=h.startsWith("Bearer ")?h.slice(7):null;
        if(!token)
            throw new ApiError(401,"Authentification requise.");
        const p=jwt.verify(token,env.jwtAccessSecret);
        const user=await User.findById(p.sub).select("-password");
        if(!user)
            throw new ApiError(401,"Utilisateur introuvable.");
        req.user=user;
        next();
    }catch(e){
        next(
            e.statusCode?e:new ApiError(401,"Token invalide ou expire.")
        );
    }
}

function optionalAuthenticate(req,res,next){
    const h=req.headers.authorization||"";
    return h.startsWith("Bearer ")?authenticate(req,res,next):next();
}

module.exports={authenticate,optionalAuthenticate};