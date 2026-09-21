const User=require("../models/User");
const authService=require("../services/authService");
const mailService=require("../services/mailService");
const env=require("../config/env");
const asyncHandler=require("../utils/asyncHandler");
const ApiError=require("../utils/apiError");
const pick=require("../utils/pick");
const userPopulate="categorie";

exports.register=asyncHandler(
    async(req,res)=>{
        const payload={...req.body};
        if(req.file)
            payload.image=`/uploads/users/${req.file.filename}`;
        res.status(201).json(
            await authService.register(payload)
        );
    }
);

exports.login=asyncHandler(
    async(req,res)=>res.json(
        await authService.login(req.body)
    )
);

exports.update=asyncHandler(
    async(req,res)=>{
        const data=pick(
            req.body,
            [
                "username",
                "email",
                "nom",
                "prenom",
                "role",
                "quartier",
                "ville",
                "categorie",
                "est_prestataire",
                "est_valide"
            ]
        );
        if(req.file)
            data.image=`/uploads/users/${req.file.filename}`;
        const user=await User.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new:true,
                runValidators:true
            }
        ).populate(userPopulate);
        if(!user)
            throw new ApiError(404,"Utilisateur introuvable.");
        res.json(user);
    }
);

exports.list=asyncHandler(
    async(req,res)=>res.json(
        await User.find().populate(userPopulate)
    )
);

exports.remove=asyncHandler(
    async(req,res)=>{
        const user=await User.findByIdAndDelete(req.params.id);
        if(!user)
            throw new ApiError(404,"Utilisateur introuvable.");
        res.status(204).send();
    }
);

exports.byLocation=asyncHandler(
    async(req,res)=>{
        const filter={
            role:{
                $in:["client","prestataire"]
            }};
            if(req.query.quartier)
                filter.quartier=new RegExp(`^${req.query.quartier}$`,"i");
            if(req.query.ville)
                filter.ville=new RegExp(`^${req.query.ville}$`,"i");
            res.json(
                await User.find(filter).populate(userPopulate)
            );
        }
    );

exports.byQuartier=asyncHandler(
    async(req,res)=>{
        const filter={
            role:{$in:["client","prestataire"]}
        };
        if(req.query.quartier)
            filter.quartier=new RegExp(`^${req.query.quartier}$`,"i");
        res.json(
            await User.find(filter).populate(userPopulate)
        );
    }
);

exports.byVille=asyncHandler(
    async(req,res)=>{
        const filter={
            role:{
                $in:["client","prestataire"]
            }
        };
        if(req.query.ville)
            filter.ville=new RegExp(`^${req.query.ville}$`,"i");
        res.json(await User.find(filter).populate(userPopulate));
    }
);

exports.byRole=asyncHandler(
    async(req,res)=>{
        const valid=[
            "client",
            "prestataire",
            "admin"
        ];
        const filter=req.query.role&&valid.includes(req.query.role)?{role:req.query.role}:{role:{$in:valid}};
        res.json(await User.find(filter).populate(userPopulate));
    }
);

exports.prestataires=asyncHandler(
    async(req,res)=>res.json(
        await User.find({role:"prestataire"}).populate(userPopulate)
    )
);

exports.prestatairesAvecCategorie=asyncHandler(
    async(req,res)=>res.json(
        await User.find({
            role:"prestataire",
            categorie:{$ne:null}
        }).populate(userPopulate)
    )
);

exports.prestatairesParCategorie=asyncHandler(
    async(req,res)=>{
        if(!req.query.categorie)
            return res.json([]);
        res.json(await User.find({
            role:"prestataire",
            categorie:req.query.categorie}).populate(userPopulate));
        }
    );

exports.detail=asyncHandler(
    async(req,res)=>{
        const user=await User.findById(req.params.id).populate(userPopulate);
        if(!user)
            throw new ApiError(404,"Utilisateur introuvable.");
        res.json(user);
    }
);

exports.resetPassword=asyncHandler(
    async(req,res)=>{
        const {user,rawToken}=await authService.createResetToken(req.body.email);
        const uidb64=Buffer.from(String(user.id)).toString("base64url");
        const link=`${env.frontendUrl}/reset_password/${uidb64}/${rawToken}/`;
        await mailService.sendMail({
            to:user.email,
            subject:"Reinitialisation de mot de passe",
            text:`Cliquez sur ce lien pour reinitialiser votre mot de passe : ${link}`
        });
        res.json({
            message:"Lien de reinitialisation envoye.",
            reset_link:env.nodeEnv==="production"?undefined:link
        });
    }
);

exports.resetPasswordConfirm=asyncHandler(
    async(req,res)=>{
        const userId=Buffer.from(
            req.params.uidb64,
            "base64url"
        ).toString("utf8");
        await authService.resetPassword(
            userId,
            req.params.token,
            req.body.password
        );
        res.json({
            message:"Mot de passe reinitialise avec succes"
        });
    }
);

exports.changePassword=asyncHandler(
    async(req,res)=>{
        const user=await User.findById(req.user.id).select("+password");
        user.password=req.body.new_password;
        await user.save();
        res.json({
            message:"Mot de passe change avec succes"
        });
    }
);