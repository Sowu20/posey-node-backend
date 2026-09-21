const jwt=require("jsonwebtoken");
const env=require("../config/env");

exports.signAccessToken=user=>jwt.sign({
    sub:user.id,
    role:user.role
},env.jwtAccessSecret,{
    expiresIn:env.jwtAccessExpiresIn
});

exports.signRefreshToken=user=>jwt.sign({
    sub:user.id,
    type:"refresh"
},env.jwtRefreshSecret,{
    expiresIn:env.jwtRefreshExpiresIn
});