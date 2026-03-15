import SurgeSession from '../models/surgeSession.js';

export const submitSurge = async (req, res) => {
  try {
    const userId = req.userId;
    const { bodySensation, urgeRating, durationMs } = req.body;

    const session = await SurgeSession.create({
      user: userId,
      bodySensation: bodySensation || undefined,
      urgeRating: urgeRating != null ? Number(urgeRating) : undefined,
      durationMs: durationMs != null ? Number(durationMs) : undefined,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: session._id,
        completedAt: session.completedAt,
      },
    });
  } catch (err) {
    console.error('Submit surge error:', err);
    return res.status(500).json({
      success: false,
      data: { message: 'Failed to save surge session' },
    });
  }
};
