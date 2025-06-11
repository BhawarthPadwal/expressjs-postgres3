const e = require('express');
const Users = require('../models/user');

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await Users.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.createUser = async (req, res) => {
    const { userId, emailId } = req.body;
    try {
        const newUser = await Users.create({ userId, emailId });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User ID or Email already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}   