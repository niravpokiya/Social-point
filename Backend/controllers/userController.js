const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    console.log('✅ REACHED updateProfile controller');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    const { name, bio, avatar } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, bio, avatar } },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('❌ ERROR in updateProfile:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
