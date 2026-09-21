const connectDatabase=require("../config/database");
const User=require("../models/User");

async function run(){
    await connectDatabase();
    const email=process.env.ADMIN_EMAIL||"admin@posey.local";
    const exists=await User.findOne({email});
    if(exists){
        console.log("Admin already exists",email);
        process.exit(0);
    }
    await User.create({
        username:process.env.ADMIN_USERNAME||"admin",
        email,password:process.env.ADMIN_PASSWORD||"admin1234",
        nom:"Admin",
        prenom:"POSEY",
        role:"admin",
        quartier:"Centre",
        ville:"Lome",
        est_valide:true
    });
    console.log("Admin created",email);
    process.exit(0);
}run().catch(error=>{
    console.error(error);
    process.exit(1);
});