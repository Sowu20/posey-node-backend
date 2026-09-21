const nodemailer=require("nodemailer");
const env=require("../config/env");

function getTransporter(){
    if(!env.smtp.host)
        return null;
    return nodemailer.createTransport({
        host:env.smtp.host,
        port:env.smtp.port,
        auth:env.smtp.user?{user:env.smtp.user,pass:env.smtp.pass}:undefined
    });
}

async function sendMail({to,subject,text}){
    const transporter=getTransporter();
    if(!transporter){
        console.log(`Email skipped to ${to}: ${subject} - ${text}`);
        return;
    }
    await transporter.sendMail({
        from:env.defaultFromEmail,
        to,
        subject,text
    });
}

module.exports={sendMail};