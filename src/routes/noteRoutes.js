const express=require("express");
const c=require("../controllers/noteController");
const router=express.Router();

router.post("/register",c.create);
router.get("/get",c.list);
router.get("/liste_notes_client/:id",c.byClient);
router.get("/liste_notes_commande/:id",c.byCommande);
router.get("/moyenne_note/:id/moyenne",c.moyenneParPrestataire);
router.get("/prestataires/top-notes",c.topPrestataires);
router.get("/prestataire-scores",c.scores);
router.get("/prestataire-note/:id",c.moyenneParPrestataire);
router.get("/commentaires/:prestataire_id",c.commentaires);

module.exports=router;