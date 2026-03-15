import User from "../models/user.js";

export const updateDecision = async (req, res) => {
  try {
    const { has_played } = req.body;

    if (typeof has_played !== 'boolean') {
      return res.status(400).json({
        success: false,
        data: {
          message: 'has_played must be a boolean'
        }
      });
    }

    const userId = req.user._id;

    const updateData = has_played
      ? { days_free: 0, last_gambling_at: new Date(), is_checked_today: true }
      : { $inc: { days_free: 1 }, is_checked_today: true };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        data: {
          message: 'User not found'
        }
      });
    }

    return res.status(200).json({
      message: has_played
        ? 'Stay strong, tomorrow is a new day.'
        : 'Great job! Keep it up.',
      days_free: updatedUser.days_free,
      last_gambling_at: updatedUser.last_gambling_at,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      data: {
        message: 'Server error',
        error: error.message
      }
    });
  }
};