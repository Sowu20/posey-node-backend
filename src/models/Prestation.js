const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    categorie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CategoriePrestation",
        required:true
    },
    titre:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    prix:{
        type:Number,
        min:0
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    date_demande:{
        type:Date,
        default:Date.now
    },
    prestataire:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    prestataire_cible:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    statut:{
        type:String,
        enum:["en_attente","accepte","terminee","annulee","refusee"],
        default:"en_attente"
    }
},{timestamps:true});

schema.methods.accepte=function(userId){
    if(this.statut!=="en_attente")
        return false;
    if(this.prestataire_cible&&String(this.prestataire_cible)!==String(userId))
        return false;
    this.prestataire=userId;
    this.statut="accepte";
    return true;
};

schema.methods.refuse=function(){
    if(this.statut!=="en_attente")
        return false;
    this.prestataire=undefined;
    this.prestataire_cible=undefined;
    this.statut="refusee";
    return true;
};

module.exports=mongoose.model("Prestation",schema);