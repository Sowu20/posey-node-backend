const app=require("./app");
const env=require("./config/env");
const connectDatabase=require("./config/database");

async function bootstrap(){
    await connectDatabase();
    app.listen(env.port,()=>console.log(
        `POSEY API running on http://localhost:${env.port}`
    ));
}

bootstrap().catch(error=>{
    console.error("Unable to start server",error);
    process.exit(1);
});