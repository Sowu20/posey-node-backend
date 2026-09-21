const express=require("express");
const c=require("../controllers/userController");
const {authenticate}=require("../middlewares/authMiddleware");
const {upload,setUploadFolder}=require("../middlewares/uploadMiddleware");
const router=express.Router();
const userUpload=[setUploadFolder("uploads/users"),upload.single("image")];

router.post("/register",userUpload,c.register);
router.post("/login",c.login);
router.put("/update/:id",userUpload,c.update);
router.get("/detail",c.list);
router.delete("/delete/:id",c.remove);
router.get("/location",c.byLocation);
router.get("/quartier",c.byQuartier);
router.get("/ville",c.byVille);
router.get("/role",c.byRole);
router.get("/prestataires",c.prestatairesAvecCategorie);
router.get("/prestataires/all",c.prestataires);
router.get("/categorie",c.prestatairesParCategorie);
router.get("/prestataires/:id",c.detail);
router.get("/:id",c.detail);
router.post("/reset_password",c.resetPassword);
router.post("/reset_password_confirm/:uidb64/:token",c.resetPasswordConfirm);
router.put("/change_password",authenticate,c.changePassword);

module.exports=router;