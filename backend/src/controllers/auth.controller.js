import bcrypt from 'bcrypt';

import User from '../models/user.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../services/jwt.js';
import { COOKIE_MAX_AGE, cookieOptions, REFRESH_COOKIE_NAME } from '../constants/cookies.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: {
          message: 'Всички полета са задължителни'
        }
      })
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        data: {
          message: 'Грешен имейл адрес'
        }
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        data: {
          message: 'Грешенa парола'
        }
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...cookieOptions,
      maxAge: COOKIE_MAX_AGE,
    });

    return res.json({
      success: true,
      data: {
        message: 'Успешно влизане',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: {
        message: 'Нещо се обърка'
      }
    });
  }
};

export const me = (req, res) => {
  const user = req.user;
  return res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      }
    },
  });
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: {
          message: 'Липсва Refresh Token'
        }
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        data: {
          message: 'Потребителя не съществува'
        }
      });
    }

    const newAccessToken = signAccessToken(user);

    const newRefreshToken = signRefreshToken(user);
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      ...cookieOptions,
      maxAge: COOKIE_MAX_AGE,
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        }
      }
    });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(401).json({
      success: false,
      data: {
        message: 'Невалиден Refresh Token'
      }
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth/refresh' });
  return res.status(500).json({
    success: false,
    data: {
      message: 'Успешно излизане'
    }
  });
};