const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -__v -emailVerificationToken -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, address } = req.body;

    const update = {};
    if (fullName) update.fullName = fullName;
    if (phone) update.phone = phone;
    if (address) {
      try {
        // If address is sent as JSON string, parse it
        update.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        update.address = address;
      }
    }

    // If a new profile image was uploaded, build public URL
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      update.profileImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password -__v -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
