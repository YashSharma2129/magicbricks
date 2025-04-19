import User from '../models/User.js';

export const createNotification = async ({ userId, type, message }) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.notifications.push({
      type,
      message,
      read: false,
      createdAt: new Date()
    });

    await user.save();
    return user.notifications[user.notifications.length - 1];
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
