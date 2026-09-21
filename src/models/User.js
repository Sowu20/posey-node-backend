const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");


const schema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
    },
    nom:{
        type:String,
        required:true,
        trim:true
    },
    prenom:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String
    },
    role:{
        type:String,
        enum:["admin","client","prestataire"],
        required:true
    },
    quartier:{
        type:String,
        required:true,
        trim:true
    },
    ville:{
        type:String,
        required:true,
        trim:true
    },
    categorie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CategoriePrestation"
    },
    est_prestataire:{
        type:Boolean,
        default:false
    },
    est_valide:{
        type:Boolean,
        default:false
    },
    date_inscription:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:{
        type:String,
        select:false
    },
    resetPasswordExpires:{
        type:Date,select:false
    }
},{timestamps:true});

schema.pre(
    "save",
    async function(next){
        if(!this.isModified("password"))
            return next();
        this.password=await bcrypt.hash(this.password,12);
        next();
    }
);


schema.methods.comparePassword=function(candidate){
    return bcrypt.compare(candidate,this.password);
};

schema.methods.toJSON=function(){
    const obj=this.toObject({virtuals:true});
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};


module.exports=mongoose.model("User",schema);