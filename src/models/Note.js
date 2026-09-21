const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    prestataire:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    commande:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Commande"
    },
    commentaire:{
        type:String
    },
    score:{
        type:Number,
        required:true,
        min:1,
        max:5
    }
},{timestamps:true});

module.exports=mongoose.model("Note",schema);