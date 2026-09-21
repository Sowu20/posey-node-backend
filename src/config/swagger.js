const swaggerJsdoc=require("swagger-jsdoc");

const swaggerUi=require("swagger-ui-express");

const spec=swaggerJsdoc({
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Posey API",
            version:"1.0.0",description:"Documentation de l'API POSEY Node.js"
        }},
        apis:["./src/routes/*.js"]
    }
);

module.exports=function mountSwagger(app){
    app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(spec));
    app.get("/swagger.json",(req,res)=>res.json(spec));
};