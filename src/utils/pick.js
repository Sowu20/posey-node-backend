module.exports=(source,allowed)=>allowed.reduce((out,key)=>{
    if(source[key]!==undefined)
        out[key]=source[key];
    return out;
},{});
