const Campaigns = require("../models/campaign");
const Votes = require("../models/votes");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

exports.getCampaignById = async (req, res) => {
  const campaignId = req.params.id;
  try {
    const campaign = await Campaigns.findOne({
      where: { campaignId },
      include: [
        {
          model: Votes,
          as: "Votes",
          attributes: [],
        },
      ],
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Get vote counts for the campaign
    const voteCounts = await Votes.findAll({
      where: { campaignId },
      attributes: [
        "voteType",
        [sequelize.fn("COUNT", sequelize.col("voteType")), "count"],
      ],
      group: ["voteType"],
    });

    // Format vote counts for easier consumption
    let upvotes = 0;
    let downvotes = 0;

    voteCounts.forEach((count) => {
      if (count.voteType === "upvote") {
        upvotes = parseInt(count.get("count"));
      } else if (count.voteType === "downvote") {
        downvotes = parseInt(count.get("count"));
      }
    });

    // Add vote counts to campaign data
    const campaignWithVotes = {
      ...campaign.toJSON(),
      votes: {
        upvotes,
        downvotes,
        total: upvotes - downvotes,
      },
    };

    res.status(200).json(campaignWithVotes);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAllCampaigns = async (req, res) => {
  try {
    // Extract query params
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const query = req.query.query || "";
    const sort = req.query.sort || "recent";

    // Define where clause for title search
    let where = {};
    if (query) {
      where.name = { [Op.iLike]: `%${query}%` };
    }

    // Fetch all campaigns matching query (for vote sorting)
    let campaigns = await Campaigns.findAll({ where });

    // Get vote counts for all campaigns
    const campaignsWithVotes = await Promise.all(
      campaigns.map(async (campaign) => {
        const voteCounts = await Votes.findAll({
          where: { campaignId: campaign.campaignId },
          attributes: [
            "voteType",
            [sequelize.fn("COUNT", sequelize.col("voteType")), "count"],
          ],
          group: ["voteType"],
        });

        let upvotes = 0;
        let downvotes = 0;

        voteCounts.forEach((count) => {
          if (count.voteType === "upvote") {
            upvotes = parseInt(count.get("count"));
          } else if (count.voteType === "downvote") {
            downvotes = parseInt(count.get("count"));
          }
        });

        return {
          ...campaign.toJSON(),
          votes: {
            upvotes,
            downvotes,
            total: upvotes - downvotes,
          },
        };
      })
    );

    // Sorting
    let sortedCampaigns = campaignsWithVotes;
    if (sort === "recent") {
      sortedCampaigns = campaignsWithVotes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sort === "top-rated") {
      sortedCampaigns = campaignsWithVotes.sort(
        (a, b) => b.votes.upvotes - a.votes.upvotes
      );
    } else if (sort === "a-z") {
      sortedCampaigns = campaignsWithVotes.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const paginatedCampaigns = sortedCampaigns.slice(start, start + pageSize);

    res.status(200).json({
      data: paginatedCampaigns,
      total: sortedCampaigns.length,
      page,
      pageSize,
      totalPages: Math.ceil(sortedCampaigns.length / pageSize),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCampaignsByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const campaigns = await Campaigns.findAll({
      where: { users_id: userId },
    });

    if (campaigns.length === 0) {
      return res
        .status(404)
        .json({ message: "No campaigns found for this user" });
    }

    // Get vote counts for all campaigns by this user
    const campaignsWithVotes = await Promise.all(
      campaigns.map(async (campaign) => {
        const voteCounts = await Votes.findAll({
          where: { campaignId: campaign.campaignId },
          attributes: [
            "voteType",
            [sequelize.fn("COUNT", sequelize.col("voteType")), "count"],
          ],
          group: ["voteType"],
        });

        let upvotes = 0;
        let downvotes = 0;

        voteCounts.forEach((count) => {
          if (count.voteType === "upvote") {
            upvotes = parseInt(count.get("count"));
          } else if (count.voteType === "downvote") {
            downvotes = parseInt(count.get("count"));
          }
        });

        return {
          ...campaign.toJSON(),
          votes: {
            upvotes,
            downvotes,
            total: upvotes - downvotes,
          },
        };
      })
    );

    res.status(200).json(campaignsWithVotes);
  } catch (error) {
    console.error("Error fetching user campaigns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCampaign = async (req, res) => {
  const { name, description, users_id, startDate, endDate } = req.body;
  try {
    const newCampaign = await Campaigns.create({
      name,
      description,
      users_id,
      startDate: startDate || new Date(),
      endDate,
    });

    res.status(201).json({
      ...newCampaign.toJSON(),
      votes: {
        upvotes: 0,
        downvotes: 0,
        total: 0,
      },
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid campaign data provided" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCampaignByUserId = async (req, res) => {
  const { userId, campaignId } = req.body;
  console.log("Body:", req.body); // Debugging

  if (!userId || !campaignId) {
    return res.status(400).json({ message: "userId and campaignId are required" });
  }

  try {
    const campaign = await Campaigns.findOne({
      where: {
        campaignId,
        users_id: userId,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found or not authorized" });
    }

    await Votes.destroy({ where: { campaignId } });
    await campaign.destroy();

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCampaignById = async (req, res) => {
  const { userId, campaignId, name, description, startDate, endDate } = req.body;
  console.log("Update request:", req.body); // Debugging

  // Validate required identifiers
  if (!userId || !campaignId) {
    return res.status(400).json({ message: "userId and campaignId are required" });
  }

  try {
    const campaign = await Campaigns.findOne({
      where: {
        campaignId,
        users_id: userId,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found or not authorized" });
    }

    // Update only allowed fields if they are provided
    if (name !== undefined) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (startDate !== undefined) campaign.startDate = startDate;
    if (endDate !== undefined) campaign.endDate = endDate;

    await campaign.save();

    res.status(200).json({
      message: "Campaign updated successfully",
      updatedFields: {
        ...(name && { name }),
        ...(description && { description }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


