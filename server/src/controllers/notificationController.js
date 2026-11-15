const Notification = require('../models/Notification');

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.json({ unreadCount, notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, userId: req.user.id }, { isRead: true });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification.' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications.' });
  }
};

