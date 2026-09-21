const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    nom:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
},{timestamps:true});

module.exports=mongoose.model("CategoriePrestation",schema);