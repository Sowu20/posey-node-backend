const BaseRepository=require("./baseRepository");
const Prestation=require("../models/Prestation");

class PrestationRepository extends BaseRepository{
    constructor(){
        super(Prestation);
    }populate(query){
        return query.populate("categorie client prestataire prestataire_cible");
    }
}

module.exports=new PrestationRepository();