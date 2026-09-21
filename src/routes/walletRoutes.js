const express=require("express");
const c=require("../controllers/walletController");
const router=express.Router();

router.get("/solde/:id",c.solde);
router.post("/recharge",c.recharge);
router.post("/verifier-paiement",c.verifierPaiement);
router.get("/verifier-transaction",c.verifierTransaction);
router.get("/liste_transaction",c.listTransactions);
router.get("/liste_transaction/statut",c.byStatus);
router.get("/transactions/:id",c.transactions);
router.get("/consulter-solde/:id",c.solde);
router.post("/webhook",c.webhook);

module.exports=router;