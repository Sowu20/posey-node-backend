const path=require("path");
const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const morgan=require("morgan");
const rateLimit=require("express-rate-limit");
const routes=require("./routes");
const mountSwagger=require("./config/swagger");
const {notFound,errorHandler}=require("./middlewares/errorMiddleware");

const app=express();

app.use(
    helmet({
        crossOriginResourcePolicy:{policy:"cross-origin"}
    })
);

app.use(cors());

app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({
    extended:true})
);
app.use(morgan("dev"));
app.use(rateLimit({
    windowMs:15*60*1000,
    max:1000})
);
app.use("/uploads",express.static(path.join(process.cwd(),"uploads")));
mountSwagger(app);
app.use("/api",routes);

app.get("/",(req,res)=>res.json({message:"POSEY API Node.js"}));

app.use(notFound);
app.use(errorHandler);

module.exports=app;