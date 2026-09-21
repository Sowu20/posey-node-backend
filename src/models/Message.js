const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    contenu:{
        type:String,
        required:true
    },
    date_envoie:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

module.exports=mongoose.model("Message",schema);