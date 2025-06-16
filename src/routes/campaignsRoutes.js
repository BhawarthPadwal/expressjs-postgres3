const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");

router.get("/:id", campaignController.getCampaignById);
router.get("/", campaignController.getAllCampaigns);
router.get("/user/:userId", campaignController.getCampaignsByUserId);
router.post("/", campaignController.createCampaign);
router.delete("/delete", campaignController.deleteCampaignByUserId);
router.put("/update", campaignController.updateCampaignById);

module.exports = router;