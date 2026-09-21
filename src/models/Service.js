const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    prestataire:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    categorie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CategoriePrestation",
        required:true
    },
    prestation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Prestation"
    },
    nom:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String
    },
    prix:{
        type:Number,
        min:0
    },
    image:{
        type:String
    },
    date_creation:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

module.exports=mongoose.model("Service",schema);