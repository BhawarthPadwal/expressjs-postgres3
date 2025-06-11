const Votes = require("../models/votes");
const sequelize = require("../config/database");

exports.getVotesByCampaignId = async (req, res) => {
  const campaignId = req.params.campaignId;
  try {
    const votes = await Votes.findAll({ where: { campaignId } });
    if (votes.length === 0) {
      return res
        .status(404)
        .json({ message: "No votes found for this campaign" });
    }
    res.status(200).json(votes);
  } catch (error) {
    console.error("Error fetching votes by campaign ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createVote = async (req, res) => {
  const { userId, campaignId, vote } = req.body;
  try {
    const newVote = await Votes.create({
      campaignId: campaignId,
      userId: userId,
      voteType: vote,
    });
    if (!newVote) {
      return res.status(400).json({ message: "Failed to create vote" });
    }
    res.status(201).json(newVote);
  } catch (error) {
    console.error("Error creating vote:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Vote already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getVoteByUserIdAndCampaignId = async (req, res) => {
  const { userId, campaignId } = req.params;
  try {
    const vote = await Votes.findOne({ where: { userId, campaignId } });
    if (!vote) {
      return res
        .status(404)
        .json({ message: "Vote not found for this user and campaign" });
    }
    res.status(200).json(vote);
  } catch (error) {
    console.error("Error fetching vote by user ID and campaign ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getVoteCountsByCampaignId = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    const voteCounts = await Votes.findAll({
      where: { campaignId },
      attributes: [
        "voteType",
        [sequelize.fn("COUNT", sequelize.col("voteType")), "count"],
      ],
      group: ["voteType"],
    });

    res.status(200).json(voteCounts);
  } catch (error) {
    console.error("Error fetching vote counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
