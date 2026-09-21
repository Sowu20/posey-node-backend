class BaseRepository{
    constructor(model){
        this.model=model;
    }create(data){
        return this.model.create(data);
    }findById(id,projection){
        return this.model.findById(id,projection);
    }findOne(filter,projection){
        return this.model.findOne(filter,projection);
    }find(filter={},projection){
        return this.model.find(filter,projection);
    }updateById(id,data,options={new:true,runValidators:true}){
        return this.model.findByIdAndUpdate(id,data,options);
    }deleteById(id){
        return this.model.findByIdAndDelete(id);
    }count(filter={}){
        return this.model.countDocuments(filter);
    }
}

module.exports=BaseRepository;