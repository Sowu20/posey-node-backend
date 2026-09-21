const axios=require("axios");
const env=require("../config/env");
const User=require("../models/User");
const Portefeuille=require("../models/Portefeuille");
const Transaction=require("../models/Transaction");
const walletService=require("../services/walletService");
const asyncHandler=require("../utils/asyncHandler");
const ApiError=require("../utils/apiError");

exports.solde=asyncHandler(
    async(req,res)=>{
        const user=await User.findById(req.params.id);
        if(!user)
            throw new ApiError(404,"Utilisateur introuvable.");
        const p=await Portefeuille.findOne({user:user.id});
        if(!p)
            throw new ApiError(404,"Portefeuille introuvable.");
        res.json({
            id:user.id,
            nom_utilisateur:user.username,
            solde:p.solde
        });
    }
);

exports.recharge=asyncHandler(
    async(req,res)=>res.json(
        await walletService.startPayment(req.body)
    )
);

exports.verifierPaiement=asyncHandler(
    async(req,res)=>{
        if(!req.body.tx_reference)
            throw new ApiError(400,"tx_reference est requis");
        if(!env.paygate.authToken||env.paygate.authToken==="change_me")
            throw new ApiError(400,"PAYGATE_AUTH_TOKEN non configure.");
        const response=await axios.post(
            env.paygate.statusUrl,
            {
                auth_token:env.paygate.authToken,
                tx_reference:req.body.tx_reference
            },
            {timeout:10000}
        );
        const data=response.data;
        const t=await Transaction.findOne({
            identifier:data.identifier
        });
        if(t)
            await walletService.creditTransaction(
                t,
                data.status,
                data.payment_reference
            );
        res.json({
            message:data.status===0?"Paiement effectue avec succes.":"Statut mis a jour.",
            transaction:data,
            nouveau_solde:t?(await Portefeuille.findById(t.portefeuille)).solde:null
        });
    }
);

exports.verifierTransaction=asyncHandler(
    async(req,res)=>{
        if(!req.query.identifier)
            throw new ApiError(400,"Parametre 'identifier' requis.");
        const t=await Transaction.findOne({
            identifier:req.query.identifier
        }).populate("portefeuille");
        if(!t)
            throw new ApiError(404,"Transaction non trouvee.");
        res.json({transaction:t});
    }
);

exports.transactions=asyncHandler(
    async(req,res)=>{
        const p=await Portefeuille.findOne({
            user:req.params.id
        });
        if(!p)
            throw new ApiError(404,"Portefeuille introuvable pour cet utilisateur.");
        res.json(await Transaction.find({
            portefeuille:p.id
        }).sort("-date_transaction"));
    }
);

exports.listTransactions=asyncHandler(
    async(req,res)=>res.json(
        await Transaction.find().populate("portefeuille")
    )
);

exports.byStatus=asyncHandler(
    async(req,res)=>{
        const valid=[0,2,4,6,-1];
        const statut=Number(req.query.statut);
        const filter=valid.includes(statut)?{statut}:{statut:{$in:valid}};
        res.json(await Transaction.find(filter).populate("portefeuille"));
    }
);

exports.webhook=asyncHandler(
    async(req,res)=>{
        const reference=req.body.reference||req.body.identifier;
        if(!reference)
            throw new ApiError(400,"Reference manquante.");
        if(req.body.status===undefined)
            throw new ApiError(400,"Status code manquant.");
        const t=await Transaction.findOne({
            identifier:reference
        });
        if(!t)
            throw new ApiError(
                404,
                `Transaction introuvable pour la reference: ${reference}`
            );
        await walletService.creditTransaction(
            t,
            Number(
                req.body.status
            ),
        req.body.tx_reference);
        res.json({
            message:"Webhook traite avec succes.",
            transaction_id:reference,
            new_status:Number(req.body.status)
        });
    }
);