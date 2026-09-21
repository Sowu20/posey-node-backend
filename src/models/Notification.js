const mongoose=require("mongoose");

const schema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    prestation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Prestation"
    },
    payload:{
        type:mongoose.Schema.Types.Mixed
    },
    is_read:{
        type:Boolean,default:false
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});

module.exports=mongoose.model("Notification",schema);