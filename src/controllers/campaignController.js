const Campaigns = require('../models/campaign');
const e = require('express');

exports.getCampaignById = async (req, res) => {
    const campaignId = req.params.id;
    try {
        const campaign = await Campaigns.findOne({ where: { campaignId } });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}   

exports.getAllCampaigns = async (req, res) => {  
    try {
        const campaigns = await Campaigns.findAll();
        if (campaigns.length === 0) {
            return res.status(404).json({ message: 'No campaigns found' });
        }
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

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