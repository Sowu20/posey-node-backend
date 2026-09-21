const mongoose=require("mongoose");
const Prestation=require("../models/Prestation");
const DemandeCiblee=require("../models/DemandeCiblee");
const Note=require("../models/Note");
const User=require("../models/User");
const ApiError=require("../utils/apiError");
const {notifyUser}=require("./notificationService");
const populatePrestation="categorie client prestataire prestataire_cible";

async function createPrestation(data,requester){
    const payload={...data};
    if(requester&&!payload.client)
        payload.client=requester.id;
    if(!payload.client)
        throw new ApiError(400,"Le client doit etre specifie ou connecte.");
    const prestation=await Prestation.create(payload);
    if(prestation.prestataire_cible){
        const client=requester||await User.findById(prestation.client);
        const username=client?.username||"Un client";
        await notifyUser(
            prestation.prestataire_cible,
            `Nouvelle demande de prestation : ${prestation.titre} par ${username}.`,{id:prestation.id,titre:prestation.titre,description:prestation.description,client:username},prestation.id
        );
    }
    return Prestation.findById(prestation.id).populate(populatePrestation);
}

async function acceptPrestation(id){
    const prestation=await Prestation.findById(id).populate("client prestataire_cible");
    if(!prestation)
        throw new ApiError(404,"Prestation introuvable.");
    if(prestation.statut!=="en_attente"||prestation.prestataire)
        throw new ApiError(400,"Cette prestation a deja ete attribuee.");
    if(!prestation.prestataire_cible)
        throw new ApiError(400,"Aucun prestataire cible sur cette prestation.");
    prestation.prestataire=prestation.prestataire_cible._id;prestation.statut="accepte";
    await prestation.save();
    await notifyUser(
        prestation.client._id,`Votre demande de prestation ${prestation.titre} est acceptee par ${prestation.prestataire_cible.username}.`,{id:prestation.id,statut:prestation.statut},prestation.id
    );
    return prestation;
}

async function refusePrestation(id){
    const prestation=await Prestation.findById(id).populate("client prestataire prestataire_cible");
    if(!prestation)
        throw new ApiError(404,"Prestation non trouvee.");
    const username=prestation.prestataire?.username||prestation.prestataire_cible?.username||"Un prestataire";
    prestation.prestataire=undefined;
    prestation.prestataire_cible=undefined;
    prestation.statut="refusee";
    await prestation.save();
    await notifyUser(
        prestation.client._id,`Votre demande de prestation ${prestation.titre} est refusee par ${username}.`,{},prestation.id
    );
    return prestation;
}

async function prestataireDashboard(id){
    const prestataireId=new mongoose.Types.ObjectId(id);
    const prestations=await Prestation.find(
        {
            $or:[
                {prestataire:prestataireId},
                {prestataire_cible:prestataireId}
            ]
        }
    ).populate(populatePrestation);
    const notes=await Note.find({prestataire:prestataireId}).populate("client commande");
    return{
        prestations,
        total_prestations:prestations.length,
        prestations_en_attente:prestations.filter(p=>p.statut==="en_attente").length,
        note:notes,
        total_avis:notes.length
    };
}

async function sendTargetedRequest(prestationId,prestataireId,requester){
    const prestation=await Prestation.findOne({
        _id:prestationId,
        client:requester.id
    });
    if(!prestation)
        throw new ApiError(404,"Prestation non trouvee.");
    const prestataire=await User.findOne({
        _id:prestataireId,
        role:"prestataire"
    });
    if(!prestataire)
        throw new ApiError(404,"Prestataire non trouve.");
    const demande=await DemandeCiblee.create({
        prestation:prestationId,
        prestataire:prestataireId
    });
    await notifyUser(
        prestataireId,`Vous avez recu une demande pour la prestation : '${prestation.titre}'`,{},prestationId
    );
    return demande;
}

async function respondTargetedRequest(id,etat,requester){
    if(!["acceptee","refusee"].includes(etat))
        throw new ApiError(400,"Etat invalide.");
    const demande=await DemandeCiblee.findOne({
        _id:id,
        prestataire:requester.id
    }).populate({path:"prestation",populate:"client"});
    if(!demande)
        throw new ApiError(404,"Demande introuvable ou non autorisee.");
    demande.etat=etat;
    await demande.save();
    await notifyUser(
        demande.prestation.client._id,`Votre demande pour '${demande.prestation.titre}' a ete ${etat} par le prestataire ${requester.username}`
    );
    return demande;
}

module.exports={
    createPrestation,
    acceptPrestation,
    refusePrestation,
    prestataireDashboard,
    sendTargetedRequest,
    respondTargetedRequest
};