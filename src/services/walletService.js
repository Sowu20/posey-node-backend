const axios=require("axios");
const {v4:uuidv4}=require("uuid");
const env=require("../config/env");
const User=require("../models/User");
const Portefeuille=require("../models/Portefeuille");
const Transaction=require("../models/Transaction");
const ApiError=require("../utils/apiError");
const walletRepository=require("../repositories/walletRepository");

function validatePhoneNumber(phone){
    const clean=String(phone||"").replace(/\D/g,"");
    const prefixes=["70","71","72","73","74","75","76","77","78","79","90","91","92","93","94","95","96","97","98","99"];
    return clean.length===8&&prefixes.some(p=>clean.startsWith(p));
}

async function startPayment({user_id,phone_number,amount,network,description="Achat via plateforme"}){
    if(!["FLOOZ","TMONEY"].includes(network))
        throw new ApiError(400,"Reseau non supporte. Utilisez FLOOZ ou TMONEY.");
    const montant=Number(amount);
    if(!Number.isFinite(montant)||montant<=0)
        throw new ApiError(400,"Format de montant invalide.");
    if(!validatePhoneNumber(phone_number))
        throw new ApiError(400,"Format de numero de telephone invalide pour ce reseau.");
    const user=await User.findById(user_id);
    if(!user)
        throw new ApiError(400,"Utilisateur introuvable.");
    const portefeuille=await walletRepository.findOrCreateWallet(user.id);
    const identifier=uuidv4();
    const transaction=await Transaction.create({
        portefeuille:portefeuille.id,
        montant,
        methode_payement:network,
        telephone:phone_number,
        statut:2,
        identifier,
        description
    });
    if(!env.paygate.authToken||env.paygate.authToken==="change_me")
        return{
            message:"Transaction creee en attente. Configurez PAYGATE_AUTH_TOKEN pour lancer PayGate.",
            transaction,
            paygate_response:null
        };
    const response=await axios.post(
        env.paygate.apiUrl,
        {
            auth_token:env.paygate.authToken,
            phone_number,
            amount:montant,
            identifier,
            network
        },
        {timeout:30000}
    );
    if(response.status===200&&response.data?.status===0){
        transaction.reference_externe=response.data.tx_reference;
        await transaction.save();
        return{
            message:"Paiement lance avec succes. Veuillez valider sur votre telephone.",
            transaction,
            paygate_response:response.data
        };
    }
    transaction.statut=-1;
    await transaction.save();
    throw new ApiError(400,"Echec PayGate.",response.data);
}

async function creditTransaction(transaction,status,reference){
    transaction.statut=status;
    if(reference)
        transaction.reference_externe=reference;
    if(status===0&&transaction.type_transaction==="depot"&&!transaction.portefeuille_credite){
        const portefeuille=await Portefeuille.findById(transaction.portefeuille);
        portefeuille.solde+=transaction.montant;
        await portefeuille.save();
        transaction.portefeuille_credite=true;
    }
    await transaction.save();
    return transaction;
}

module.exports={
    startPayment,
    creditTransaction
};