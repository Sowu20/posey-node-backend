const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    prestation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Prestation"
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    prestataire:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Service"
    },
    montant:{
        type:Number,
        min:0
    },
    date_commande:{
        type:Date,
        default:Date.now
    },
    statut:{
        type:String,
        enum:["en attente","accepte","termine","refusee"],
        default:"en attente"
    }
},{timestamps:true});

module.exports=mongoose.model("Commande",schema);