const express=require("express");
const c=require("../controllers/commandeController");
const {authenticate}=require("../middlewares/authMiddleware");
const router=express.Router();

router.post("/register_commande",c.create);
router.put("/update_commande/:id",c.update);
router.get("/detail_commande",c.list);
router.delete("/delete_commande/:id",c.remove);
router.get("/liste_client/:id",c.byClient);
router.get("/liste_statut",c.byStatus);
router.put("/:id/changer_statut",c.changeStatus);
router.get("/historique_commande/:id/historique",c.byClient);
router.get("/client/:id",c.byClient);
router.get("/statut/:id",c.statutsUtilisateur);
router.get("/mes_commandes",authenticate,c.mesCommandes);
router.get("/prestations_disponibles",authenticate,c.prestationsDisponibles);
router.post("/:id/accepter",authenticate,c.accept);
router.post("/:id/refuser",authenticate,c.refuse);
router.post("/creer_commande",authenticate,c.createPaid);
router.get("/:id",c.detail);

module.exports=router;