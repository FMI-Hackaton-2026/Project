export const REFRESH_COOKIE_NAME = 'refreshToken'; 

export const cookieOptions = { 
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  path: '/auth/refresh',
};

export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;