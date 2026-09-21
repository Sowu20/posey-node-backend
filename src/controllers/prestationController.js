const mongoose=require("mongoose");
const CategoriePrestation=require("../models/CategoriePrestation");
const Prestation=require("../models/Prestation");
const DemandeCiblee=require("../models/DemandeCiblee");
const Notification=require("../models/Notification");
const User=require("../models/User");
const Note=require("../models/Note");
const prestationService=require("../services/prestationService");
const asyncHandler=require("../utils/asyncHandler");
const ApiError=require("../utils/apiError");
const populatePrestation="categorie client prestataire prestataire_cible";

exports.createCategorie=asyncHandler(
    async(req,res)=>{
        const data={...req.body};
        if(req.file)
            data.image=`/uploads/categorie_images/${req.file.filename}`;
        res.status(201).json(
            await CategoriePrestation.create(data)
        );
    }
);

exports.updateCategorie=asyncHandler(
    async(req,res)=>{
        const data={...req.body};
        if(req.file)
            data.image=`/uploads/categorie_images/${req.file.filename}`;
        const item=await CategoriePrestation.findByIdAndUpdate(
            req.params.id,data,
            {
                new:true,
                runValidators:true
            }
        );
        if(!item)
            throw new ApiError(404,"Categorie introuvable.");
        res.json(item);
    }
);

exports.listCategories=asyncHandler(
    async(req,res)=>res.json(
        await CategoriePrestation.find()
    )
);

exports.deleteCategorie=asyncHandler(
    async(req,res)=>{
        const item=await CategoriePrestation.findByIdAndDelete(req.params.id);
        if(!item)
            throw new ApiError(404,"Categorie introuvable.");
        res.status(204).send();
    }
);

exports.prestatairesNonValides=asyncHandler(
    async(req,res)=>res.json(
        await User.find({
            est_prestataire:true,
            est_valide:false
        }).populate("categorie")
    )
);

exports.validerPrestataire=asyncHandler(
    async(req,res)=>{
        const user=await User.findOneAndUpdate(
            {
                _id:req.params.id,
                est_prestataire:true
            },
            {
                est_valide:true
            },
            {new:true}
        );
        if(!user)
            throw new ApiError(404,"Prestataire non trouve.");
        res.json({
            message:"Prestataire valide.",user
        });
    }
);

exports.createPrestation=asyncHandler(
    async(req,res)=>res.status(201).json(
        await Prestation.create(req.body)
    )
);

exports.updatePrestation=asyncHandler(
    async(req,res)=>{
        const item=await Prestation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true,
                runValidators:true
            }
        ).populate(populatePrestation);
        if(!item)
            throw new ApiError(404,"Prestation introuvable.");
        res.json(item);
    }
);

exports.listPrestations=asyncHandler(
    async(req,res)=>res.json(
        await Prestation.find().populate(populatePrestation)
    )
);

exports.deletePrestation=asyncHandler(
    async(req,res)=>{
        const item=await Prestation.findByIdAndDelete(req.params.id);
        if(!item)
            throw new ApiError(404,"Prestation introuvable.");
        res.status(204).send();
    }
);

exports.demandePrestation=asyncHandler(
    async(req,res)=>res.status(201).json(
        await prestationService.createPrestation(
            req.body,
            req.user
        )
    )
);

exports.prestataireDashboard=asyncHandler(
    async(req,res)=>res.json(
        await prestationService.prestataireDashboard(req.params.id)
    )
);

exports.acceptPrestation=asyncHandler(
    async(req,res)=>res.json({
        message:"Prestation acceptee",
        prestation:await prestationService.acceptPrestation(req.params.id)
    })
);

exports.refusePrestation=asyncHandler(
    async(req,res)=>res.json({
        message:"La prestation est refusee avec succes.",
        prestation:await prestationService.refusePrestation(req.params.id)
    })
);

exports.available=asyncHandler(
    async(req,res)=>res.json(
        await Prestation.find({
            statut:"en_attente",
            prestataire:null
        }).populate(populatePrestation)
    )
);

exports.enAttente=asyncHandler(
    async(req,res)=>{
        const prestations=await Prestation.find({
            statut:"en_attente",
            prestataire:null
        }).sort("-date_demande").populate(populatePrestation);
        res.json({
            prestations,
            count:prestations.length
        });
    }
);

exports.prestationsClient=asyncHandler(
    async(req,res)=>res.json(
        await Prestation.find({
            client:req.params.id
        }).sort("-date_demande").populate(populatePrestation)
    )
);

exports.stats=asyncHandler(
    async(req,res)=>{
        const id=new mongoose.Types.ObjectId(req.params.id);
        const total=await Prestation.countDocuments({
            $or:[
                {prestataire:id},
                {prestataire_cible:id}
            ]}
        );
        const enAttente=await Prestation.countDocuments({
            prestataire_cible:id,
            statut:"en_attente"
        });
        res.json({
            total_prestations:total,
            prestations_en_attente:enAttente
        });
    }
);

exports.noteMoyenne=asyncHandler(
    async(req,res)=>{
        const r=await Note.aggregate([
            {
                $match:{
                    prestataire:new mongoose.Types.ObjectId(req.params.id)
                }
            },
            {
                $group:{
                    _id:null,
                    moyenne_score:{$avg:"$score"}
                }
            }
        ]);
        res.json({
            moyenne_score:r[0]?.moyenne_score?Math.round(r[0].moyenne_score*10)/10:0
        });
    }
);

exports.avis=asyncHandler(
    async(req,res)=>{
        const avis=await Note.find({
            prestataire:req.params.id
        }).populate("client commande");
        res.json({
            total_avis:avis.length,avis
        });
    }
);

exports.createDemandeCiblee=asyncHandler(
    async(req,res)=>res.status(201).json(
        await DemandeCiblee.create(req.body)
    )
);

exports.envoyerDemande=asyncHandler(
    async(req,res)=>res.status(201).json(
        await prestationService.sendTargetedRequest(
            req.body.prestation,
            req.body.prestataire,
            req.user
        )
    )
);

exports.repondreDemande=asyncHandler(
    async(req,res)=>res.json(
        await prestationService.respondTargetedRequest(
            req.params.id,
            req.body.etat,
            req.user
        )
    )
);

exports.demandesRecues=asyncHandler(
    async(req,res)=>{
        const demandes=await DemandeCiblee.find({
            prestataire:req.params.id,
            etat:"en_attente"
        }).populate({path:"prestation",populate:"client"});
        res.json(demandes.map(d=>({
            demande_id:d.id,
            prestation_id:d.prestation?._id,
            titre:d.prestation?.titre,
            description:d.prestation?.description,
            statut:d.prestation?.statut,
            date_demande:d.prestation?.date_demande,
            client:`${d.prestation?.client?.prenom||""} ${d.prestation?.client?.nom||""}`.trim()
        })));
    }
);

exports.refusees=asyncHandler(
    async(req,res)=>res.json(
        await Prestation.find({
            statut:"refusee"
        }).populate(populatePrestation)
    )
);

exports.notifications=asyncHandler(
    async(req,res)=>res.json(
        await Notification.find({
            user:req.user.id
        }).sort("-timestamp").populate("prestation")
    )
);

exports.markNotificationRead=asyncHandler(
    async(req,res)=>{
        const n=await Notification.findOneAndUpdate(
            {
                _id:req.params.id,
                user:req.user.id
            },
            {is_read:true},
            {new:true}
        );
        if(!n)
            throw new ApiError(404,"Notification non trouvee.");
        res.json({
            message:"Notification marquee comme lue.",
            notification:n
        });
    }
);

exports.markAllRead=asyncHandler(
    async(req,res)=>{
        await Notification.updateMany(
            {user:req.user.id},
            {is_read:true}
        );
        res.json({
            message:"Toutes les notifications marquees comme lues."
        });
    }
);

exports.deleteNotification=asyncHandler(
    async(req,res)=>{
        const n=await Notification.findOneAndDelete(
            {
                _id:req.params.id,
                user:req.user.id
            }
        );
        if(!n)
            throw new ApiError(404,"Notification introuvable.");
        res.status(204).send();
    }
);

exports.termineesParPrestataire=asyncHandler(
    async(req,res)=>res.json({
        total:await Prestation.countDocuments({
            prestataire:req.params.id,
            statut:"terminee"})
        }
    )
);

exports.avecPrix=asyncHandler(
    async(req,res)=>res.json(
        await Prestation.find({
            prix:{$ne:null}
        }).sort("-date_demande").populate(populatePrestation)
    )
);