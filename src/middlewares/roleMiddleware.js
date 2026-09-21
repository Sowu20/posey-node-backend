const ApiError=require("../utils/apiError");

module.exports=(...roles)=>(req,res,next)=>{
    if(!req.user)
        return next(new ApiError(
            401,
            "Authentification requise."
        ));
    if(!roles.includes(req.user.role))
        return next(new ApiError(403,"Acces refuse."));
    next();
};