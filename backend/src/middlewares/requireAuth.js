import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from '../services/jwt.js';
import User from '../models/user.js';
import { COOKIE_MAX_AGE, REFRESH_COOKIE_NAME, refreshCookieOptions } from '../constants/cookies.js';

export const requireAuth = async (req, res, next) => {
  let newAccessToken = null;

  try {
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        const user = await User.findById(decoded.sub).lean();

        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.userId = user._id.toString();

        return next();
      } catch (err) {
      }
    }

    const refreshFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const refreshFromHeader = req.headers['x-refresh-token'];
    const refreshFromBody = req.body?.refreshToken;
    const refreshToken = refreshFromCookie || refreshFromHeader || refreshFromBody;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Не се ауторизиран' });
    }

    let decodedRefresh;
    try {
      decodedRefresh = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ message: 'Невалидна сесия' });
    }

    const user = await User.findById(decodedRefresh.sub).lean();
    if (!user) {
      return res.status(401).json({ message: 'потребителят не е открит' });
    }

    newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      ...refreshCookieOptions,
      maxAge: COOKIE_MAX_AGE 
    });

    res.setHeader('x-access-token', newAccessToken);

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      return originalJson({
        ...data,
        accessToken: newAccessToken,
      });
    };

    req.user = user;
    req.userId = user._id.toString();

    return next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};