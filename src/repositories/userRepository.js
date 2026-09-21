const BaseRepository=require("./baseRepository");
const User=require("../models/User");

class UserRepository extends BaseRepository{
    constructor(){
        super(User);
    }findByEmail(email){
        return User.findOne({email}).select("+password +resetPasswordToken +resetPasswordExpires");
    }findByUsername(username){
        return User.findOne({username}).select("+password");
    }
}

module.exports=new UserRepository();
