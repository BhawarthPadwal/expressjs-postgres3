const express = require('express');
const router = express.Router();

const votesController = require('../controllers/voteController');

router.get('/campaign/:campaignId', votesController.getVotesByCampaignId);
router.post('/', votesController.createVote);
router.get('/user/:userId/campaign/:campaignId', votesController.getVoteByUserIdAndCampaignId);
router.get('/count/campaign/:campaignId', votesController.getVoteCountsByCampaignId);

module.exports = router;
