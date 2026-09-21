const Commande=require("../models/Commande");
const Service=require("../models/Service");
const Portefeuille=require("../models/Portefeuille");
const ApiError=require("../utils/apiError");

async function createPaidOrder(user,serviceId){
    const portefeuille=await Portefeuille.findOne({
        user:user.id
    });
    if(!portefeuille)
        throw new ApiError(400,"Portefeuille introuvable.");
    const service=await Service.findById(serviceId).populate("prestataire");
    if(!service)
        throw new ApiError(404,"Service introuvable.");
    if(portefeuille.solde<service.prix)
        throw new ApiError(400,"Solde insuffisant, veuillez recharger votre portefeuille.");
    portefeuille.solde-=service.prix;
    await portefeuille.save();
    const commande=await Commande.create({client:user.id,prestation:service.prestation,service:service.id,prestataire:service.prestataire._id,montant:service.prix,statut:"en attente"});return{commande,service,nouveau_solde:portefeuille.solde};}

module.exports={createPaidOrder};