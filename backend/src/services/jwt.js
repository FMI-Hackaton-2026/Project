import jwt from 'jsonwebtoken';
import {
    REFRESH_LONG_EXPIRES_IN,
    REFRESH_SHORT_EXPIRES_IN,
    ACCESS_TOKEN_EXPIRES_IN
} from '../constants/jwtExpireTimes.js';

export const signAccessToken = (admin) => {
    const payload = {
        sub: admin._id.toString(),
        type: 'access',
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
};

export const signRefreshToken = (admin, rememberMe = false) => {
    const payload = {
        sub: admin._id.toString(),
        type: 'refresh',
        rememberMe,
    };

    const expiresIn = rememberMe
        ? REFRESH_LONG_EXPIRES_IN
        : REFRESH_SHORT_EXPIRES_IN;

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn,
    });
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};