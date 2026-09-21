const express=require("express");
const c=require("../controllers/serviceController");
const {authenticate}=require("../middlewares/authMiddleware");
const {upload,setUploadFolder}=require("../middlewares/uploadMiddleware");
const router=express.Router();
const serviceUpload=[setUploadFolder("uploads/service_images"),upload.single("image")];

router.route("/mes_services/:prestataire_id").get(c.listCreate)
                                             .post(authenticate,serviceUpload,c.listCreate);
router.post("/register_service",authenticate,serviceUpload,c.create);
router.get("/list_service/:id",c.byPrestataire);
router.put("/update_service/:id",serviceUpload,c.update);
router.delete("/delete_service/:id",c.remove);

module.exports=router;