import User from '../models/user.js';
import SurgeSession from '../models/surgeSession.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days free from DB: from last_gambling_at (days since that date) or user.days_free */
function getDaysFree(user) {
  if (!user) return 0;
  if (user.last_gambling_at) {
    const elapsed = Date.now() - new Date(user.last_gambling_at).getTime();
    return Math.max(0, Math.floor(elapsed / MS_PER_DAY));
  }
  return user.days_free != null ? user.days_free : 0;
}

export const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, data: { message: 'User not found' } });
    }

    const daysFree = getDaysFree(user);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await SurgeSession.find({
      user: userId,
      completedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ completedAt: 1 })
      .lean()
      .select('completedAt urgeRating durationMs');

    const totalSurges = await SurgeSession.countDocuments({ user: userId });

    const byWeek = [];
    const weekLabels = ['Тази седмица', 'Преди 1 седм.', 'Преди 2 седм.', 'Преди 3 седм.'];
    for (let i = 0; i < 4; i++) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const count = await SurgeSession.countDocuments({
        user: userId,
        completedAt: { $gte: start, $lt: end },
      });
      byWeek.push({
        label: weekLabels[i],
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        count,
      });
    }

    const urgeRatings = sessions.map((s) => ({
      date: s.completedAt.toISOString().slice(0, 10),
      rating: s.urgeRating,
    }));

    const avgUrge =
      urgeRatings.length > 0
        ? urgeRatings.reduce((a, b) => a + (b.rating ?? 0), 0) / urgeRatings.length
        : null;

    return res.json({
      success: true,
      data: {
        daysFree,
        totalSurges,
        surgeSessionsByWeek: byWeek,
        urgeRatings: urgeRatings.slice(-14),
        averageUrgeRating: avgUrge,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({
      success: false,
      data: { message: 'Failed to load stats' },
    });
  }
};

export const setLastGambling = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({
        success: false,
        data: { message: 'date is required (ISO string)' },
      });
    }
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({
        success: false,
        data: { message: 'Invalid date' },
      });
    }
    await User.findByIdAndUpdate(userId, { last_gambling_at: d });
    return res.json({
      success: true,
      data: { message: 'Updated' },
    });
  } catch (err) {
    console.error('Set last gambling error:', err);
    return res.status(500).json({
      success: false,
      data: { message: 'Failed to update' },
    });
  }
};
