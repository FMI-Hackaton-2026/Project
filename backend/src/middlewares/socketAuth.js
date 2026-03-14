import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from '../services/jwt.js';
import User from '../models/user.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const { accessToken, refreshToken } = socket.handshake.auth ?? {};

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        const user = await User.findById(decoded.sub).lean();

        if (!user) return next(new Error('Не е открит потребител'));

        socket.user = user;
        socket.userId = user._id.toString();
        return next();
      } catch {
      }
    }

    if (!refreshToken) {
      return next(new Error('Не сте аутентикиран'));
    }

    let decodedRefresh;
    try {
      decodedRefresh = verifyRefreshToken(refreshToken);
    } catch {
      return next(new Error('Невалидна сесия'));
    }

    const user = await User.findById(decodedRefresh.sub).lean();
    if (!user) return next(new Error('Потребителя не е открит'));

    socket.user = user;
    socket.userId = user._id.toString();
    socket._newAccessToken = signAccessToken(user);
    socket._newRefreshToken = signRefreshToken(user);

    return next();
  } catch (err) {
    console.error('socketAuthMiddleware error:', err);
    return next(new Error('Неауторизиран'));
  }
};

export const emitRefreshedTokens = (socket) => {
  if (socket._newAccessToken && socket._newRefreshToken) {
    socket.emit('REFRESH', {
      accessToken: socket._newAccessToken,
      refreshToken: socket._newRefreshToken,
    });
    delete socket._newAccessToken;
    delete socket._newRefreshToken;
  }
};