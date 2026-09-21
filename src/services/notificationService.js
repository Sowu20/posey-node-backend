const Notification=require("../models/Notification");

async function notifyUser(userId,message,payload={},prestation=undefined){
    return Notification.create({
        user:userId,message,payload,prestation
    });
}

module.exports={notifyUser};