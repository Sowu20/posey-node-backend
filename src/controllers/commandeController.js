const Commande=require("../models/Commande");
const Prestation=require("../models/Prestation");
const User=require("../models/User");
const commandeService=require("../services/commandeService");
const asyncHandler=require("../utils/asyncHandler");
const ApiError=require("../utils/apiError");
const populate="prestation client prestataire service";

exports.create=asyncHandler(
    async(req,res)=>res.status(201).json(
        await Commande.create(req.body)
    )
);

exports.update=asyncHandler(
    async(req,res)=>{
        const c=await Commande.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true,runValidators:true}
        ).populate(populate);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        res.json(c);
    }
);

exports.list=asyncHandler(
    async(req,res)=>res.json(
        await Commande.find().populate(populate)
    )
);

exports.remove=asyncHandler(
    async(req,res)=>{
        const c=await Commande.findByIdAndDelete(req.params.id);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        res.status(204).send();
    }
);

exports.byClient=asyncHandler(
    async(req,res)=>res.json(
        await Commande.find(
            {client:req.params.id}
        ).sort("-date_commande")
         .populate(populate)));

exports.byStatus=asyncHandler(
    async(req,res)=>{
        const filter=req.query.statut?{statut:req.query.statut}:{};
        res.json(
            await Commande.find(filter).populate(populate)
        );
    }
);

exports.changeStatus=asyncHandler(
    async(req,res)=>{
        const allowed=["en attente","accepte","termine","refusee"];
        if(!allowed.includes(req.body.statut))
            throw new ApiError(400,"Statut invalide.");
        const c=await Commande.findByIdAndUpdate(
            req.params.id,
            {statut:req.body.statut},
            {new:true}
        ).populate(populate);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        res.json(c);
    }
);

exports.detail=asyncHandler(
    async(req,res)=>{
        const c=await Commande.findById(req.params.id).populate(populate);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        res.json(c);
    }
);

exports.statutsUtilisateur=asyncHandler(
    async(req,res)=>{
        const user=await User.findById(req.params.id);
        if(!user)throw new ApiError(404,"Utilisateur introuvable.");
        res.json(
            {
                statuts:await Commande.find({client:req.params.id})
                                      .distinct("statut")
            }
        );
    }
);

exports.mesCommandes=asyncHandler(
    async(req,res)=>res.json(
        await Commande.find({prestataire:req.user.id})
        .sort("-date_commande")
        .populate(populate)
    )
);

exports.prestationsDisponibles=asyncHandler(
    async(req,res)=>{
        const filter={
            statut:"en_attente",prestataire:null
        };
        if(req.user.categorie)
            filter.categorie=req.user.categorie;
        res.json(await Prestation.find(filter).populate("categorie client"));
    }
);

exports.accept=asyncHandler(
    async(req,res)=>{
        const c=await Commande.findById(req.params.id);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        if(c.statut!=="en attente")
            throw new ApiError(400,"Cette commande a deja ete traitee.");
        c.prestataire=req.user.id;
        c.statut="accepte";
        await c.save();
        res.json(
            {
                success:"Commande acceptee"
            }
        );
    }
);

exports.refuse=asyncHandler(
    async(req,res)=>{
        const c=await Commande.findById(req.params.id);
        if(!c)
            throw new ApiError(404,"Commande introuvable.");
        if(c.statut!=="en attente")
            throw new ApiError(400,"Impossible de refuser, cette commande est deja traitee.");
        c.statut="refusee";
        await c.save();
        res.json(
            {
                success:"Commande refusee"
            }
        );
    }
);

exports.createPaid=asyncHandler(
    async(req,res)=>{
        const {commande,service,nouveau_solde}=await commandeService.createPaidOrder(
            req.user,
            req.body.service_id
        );
        res.status(201).json(
            {
                message:"Commande payee et creee avec succes.",
                commande_id:commande.id,
                service:service.nom,
                prestataire:service.prestataire.nom,
                montant_deduit:service.prix,
                nouveau_solde
            }
        );
    }
);