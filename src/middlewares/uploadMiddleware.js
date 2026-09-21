const path=require("path");
const multer=require("multer");
const ApiError=require("../utils/apiError");

const storage=multer.diskStorage({
    destination(req,file,cb){
        cb(
            null,
            path.join(process.cwd(),
            req.uploadFolder||"uploads")
        );
    },
    filename(req,file,cb){
        cb(
            null,
            `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`
        );
    }
});

const upload=multer({
    storage,limits:{fileSize:5*1024*1024},
    fileFilter(req,file,cb){
        if(!file.mimetype.startsWith("image/"))
            return cb(new ApiError(400,"Seules les images sont autorisees."));
        cb(null,true);
    }
});

exports.upload=upload;

exports.setUploadFolder=folder=>(req,res,next)=>{
    req.uploadFolder=folder;
    next();
};