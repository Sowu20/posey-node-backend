const Portefeuille=require("../models/Portefeuille");
const Transaction=require("../models/Transaction");

module.exports={
    findOrCreateWallet(userId){
        return Portefeuille.findOneAndUpdate(
            {user:userId},
            {$setOnInsert:{
                user:userId,
                solde:0}},
            {new:true,upsert:true}
        );
    },
    walletByUser(userId){
        return Portefeuille.findOne({
            user:userId
        });
    },createTransaction(data){
        return Transaction.create(data);
    },transactionByIdentifier(identifier){
        return Transaction.findOne({
            identifier
        }).populate("portefeuille");
    }
};