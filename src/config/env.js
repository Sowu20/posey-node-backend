const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    nodeEnv:process.env.NODE_ENV||"development",
    port:process.env.PORT||5000,
    mongoUri:process.env.MONGO_URI||"mongodb://127.0.0.1:27017/posey",
    jwtAccessSecret:process.env.JWT_ACCESS_SECRET||"dev_access_secret",
    jwtRefreshSecret:process.env.JWT_REFRESH_SECRET||"dev_refresh_secret",
    jwtAccessExpiresIn:process.env.JWT_ACCESS_EXPIRES_IN||"1d",
    jwtRefreshExpiresIn:process.env.JWT_REFRESH_EXPIRES_IN||"7d",
    frontendUrl:process.env.FRONTEND_URL||"http://localhost:3000",
    defaultFromEmail:process.env.DEFAULT_FROM_EMAIL||"no-reply@posey.local",
    smtp:{
        host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),
        user:process.env.SMTP_USER,pass:process.env.SMTP_PASS
    },
    paygate:{
        apiUrl:process.env.PAYGATE_API_URL||"https://paygateglobal.com/api/v1/pay",
        statusUrl:process.env.PAYGATE_STATUS_URL||"https://paygateglobal.com/api/v1/status",
        authToken:process.env.PAYGATE_AUTH_TOKEN
    }
};