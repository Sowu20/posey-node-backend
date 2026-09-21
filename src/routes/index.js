const express=require("express");
const router=express.Router();

router.get("/health",(req,res)=>res.json({
    status:"ok",
    service:"posey-node-backend"
}));

router.use("/user",require("./userRoutes"));
router.use("/prestation",require("./prestationRoutes"));
router.use("/commande",require("./commandeRoutes"));
router.use("/portefeuille",require("./walletRoutes"));
router.use("/note",require("./noteRoutes"));
router.use("/service",require("./serviceRoutes"));

module.exports=router;