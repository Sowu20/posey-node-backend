const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    prestation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Prestation",
        required:true
    },
    prestataire:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",required:true
    },
    etat:{
        type:String,
        enum:["en_attente","acceptee","refusee"],
        default:"en_attente"
    },
    date_envoi:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

schema.index(
    {
        prestation:1,
        prestataire:1
    },
    {unique:true}
);

module.exports=mongoose.model("DemandeCiblee",schema);