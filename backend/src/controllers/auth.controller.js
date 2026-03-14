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
          status: user.status,
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
