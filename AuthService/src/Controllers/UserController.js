const User = require('../Models/User.js');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ idUser: req.params.id });
    if (!user) return res.status(404).send('User not found');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findOneAndUpdate({ idUser: req.params.id }, updates, { new: true });
    if (!user) return res.status(404).send('User not found');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
//GET ALL
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) return res.status(404).send('No users found');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
