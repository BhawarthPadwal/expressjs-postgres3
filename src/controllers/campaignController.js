const Campaigns = require('../models/campaign');
const e = require('express');
const { fn, col, literal, Op, where } = require('sequelize');
const Votes = require('../models/votes');
const sequelize = require('../config/database');

exports.getCampaignById = async (req, res) => {
    const campaignId = req.params.id;
    try {
        const campaign = await Campaigns.findOne({
            where: { campaignId },
            include: [
                {
                    model: Votes,
                    as: 'Votes',
                    attributes: ['userId', 'voteType']
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`SUM(CASE WHEN "Votes"."voteType" = 'upvote' THEN 1 ELSE 0 END)`),
                        'upvoteCount'
                    ],
                    [
                        sequelize.literal(`SUM(CASE WHEN "Votes"."voteType" = 'downvote' THEN 1 ELSE 0 END)`),
                        'downvoteCount'
                    ]
                ]
            },
            group: ['Campaigns.campaignId', 'Votes.voteId']
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Sequelize returns an array if group is used, so handle accordingly
        let result = campaign;
        if (Array.isArray(campaign)) {
            result = campaign[0];
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getAllCampaigns = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'recent';
    const search = req.query.search || '';

    const searchCondition = search ? { name: { [Op.iLike]: `%${search}%` } } : {};

    let order = [['createdAt', 'DESC']];
    if (sort.toLowerCase() === 'a-z') {
        order = [['name', 'ASC']];
    } else if (sort.toLowerCase() === 'z-a') {
        order = [['name', 'DESC']];
    } else if (sort.toLowerCase() === 'recent') {
        order = [['createdAt', 'DESC']];
    }

    try {
        // Get all campaigns with vote counts using associations
        const { count, rows } = await Campaigns.findAndCountAll({
            where: searchCondition,
            offset: (page - 1) * limit,
            limit: limit,
            order: order,
            include: [
                {
                    model: Votes,
                    as: 'Votes',
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`SUM(CASE WHEN "Votes"."voteType" = 'upvote' THEN 1 ELSE 0 END)`),
                        'upvoteCount'
                    ],
                    [
                        sequelize.literal(`SUM(CASE WHEN "Votes"."voteType" = 'downvote' THEN 1 ELSE 0 END)`),
                        'downvoteCount'
                    ]
                ]
            },
            group: ['Campaigns.campaignId']
        });

        let campaigns = rows;

        // If sorting by top voted, sort in-memory by upvoteCount
        if (sort.toLowerCase() === 'top voted' || sort.toLowerCase() === 'top-rated') {
            campaigns = campaigns.sort((a, b) => {
                const upA = parseInt(a.get('upvoteCount')) || 0;
                const upB = parseInt(b.get('upvoteCount')) || 0;
                return upB - upA;
            });
        }

        if (!campaigns || campaigns.length === 0) {
            return res.status(404).json({ message: 'No campaigns found' });
        }

        const totalItems = Array.isArray(count) ? count.length : count;

        res.status(200).json({
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            campaigns
        });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCampaignsByUserId = async (req, res) => {
    const userId = req.params.userId; // error prone "userId" should match to route
    try {
        const campaigns = await Campaigns.findAll({ where: { users_id: userId } });
        if (campaigns.length === 0) {
            return res.status(404).json({ message: 'No campaigns found for this user' });
        }
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns by user ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.createCampaign = async (req, res) => {
    const { name, description, users_id, startDate, endDate } = req.body;
    try {
        const newCampaign = await Campaigns.create({ name, description, users_id, startDate, endDate });
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Campaign already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};