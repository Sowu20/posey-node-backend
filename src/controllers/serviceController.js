const Service=require("../models/Service");
const asyncHandler=require("../utils/asyncHandler");
const ApiError=require("../utils/apiError");
const populate="prestataire categorie prestation";

exports.listCreate=asyncHandler(
    async(req,res)=>{
        if(req.method==="GET"){
            const id=req.params.prestataire_id||req.user?.id;
            return res.json(
                await Service.find({prestataire:id}).sort("-date_creation").populate(populate)
            );
        }
        const data={
            ...req.body,
            prestataire:req.user.id
        };
        if(req.file)
            data.image=`/uploads/service_images/${req.file.filename}`;
        res.status(201).json(
            await Service.create(data)
        );
    }
);

exports.create=asyncHandler(
    async(req,res)=>{
        const data={
            ...req.body,
            prestataire:req.user.id
        };
        if(req.file)
            data.image=`/uploads/service_images/${req.file.filename}`;
        res.status(201).json(
            await Service.create(data)
        );
    }
);

exports.byPrestataire=asyncHandler(
    async(req,res)=>res.json(
        await Service.find({
            prestataire:req.params.id
        }).sort("-date_creation").populate(populate)
    )
);

exports.update=asyncHandler(
    async(req,res)=>{
        const data={...req.body};
        if(req.file)
            data.image=`/uploads/service_images/${req.file.filename}`;
        const service=await Service.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new:true,
                runValidators:true
            }).populate(populate);
            if(!service)
                throw new ApiError(404,"Service introuvable.");
            res.json(service);
        }
    );

exports.remove=asyncHandler(
    async(req,res)=>{
        const service=await Service.findByIdAndDelete(req.params.id);
        if(!service)
            throw new ApiError(404,"Service introuvable.");
        res.status(204).send();
    }
);