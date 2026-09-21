exports.notFound=(req,res,next)=>res.status(404).json(
    {message:`Route introuvable: ${req.method} ${req.originalUrl}`
});

exports.errorHandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const payload={
        message:err.message||"Erreur serveur",
        details:err.details
    };
    if(process.env.NODE_ENV!=="production")
        payload.stack=err.stack;
    res.status(statusCode).json(payload);
};