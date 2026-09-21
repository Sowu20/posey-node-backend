const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    solde:{
        type:Number,
        default:0,
        min:0
    },
    date_mise_a_jour:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

schema.pre(
    "save",
    function(next){
        this.date_mise_a_jour=new Date();
        next();
    }
);

module.exports=mongoose.model("Portefeuille",schema);