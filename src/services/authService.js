const crypto=require("crypto");
const userRepository=require("../repositories/userRepository");
const {signAccessToken,signRefreshToken}=require("../utils/tokens");
const ApiError=require("../utils/apiError");

async function register(data){
    const exists=await userRepository.findOne({
        $or:[
            {email:data.email},
            {username:data.username}
        ]}
    );
        if(exists)
            throw new ApiError(409,"Email ou nom d'utilisateur deja utilise.");
        const user=await userRepository.create(data);
        return{
            user,
            access:signAccessToken(user),
            refresh:signRefreshToken(user)
        };
    }

async function login({email,username,password}){
    const user=email?await userRepository.findByEmail(email):await userRepository.findByUsername(username);
    if(!user||!(await user.comparePassword(password)))
        throw new ApiError(400,"Identifiants invalides.");
    return{
        user,
        access:signAccessToken(user),
        refresh:signRefreshToken(user)
    };
}

async function createResetToken(email){
    const user=await userRepository.findByEmail(email);
    if(!user)
        throw new ApiError(404,"Aucun utilisateur trouve avec cet email.");
    const rawToken=crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken=crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires=new Date(Date.now()+1000*60*30);
    await user.save();
    return{
        user,
        rawToken
    };
}

async function resetPassword(userId,token,password){
    const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
    const user=await userRepository.findOne({
        _id:userId,
        resetPasswordToken:hashedToken,
        resetPasswordExpires:{$gt:new Date()}
    }).select("+password +resetPasswordToken +resetPasswordExpires");
    if(!user)
        throw new ApiError(400,"Token invalide ou expire.");
    user.password=password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpires=undefined;
    await user.save();
    return user;
}

module.exports={
    register,
    login,
    createResetToken,
    resetPassword
};