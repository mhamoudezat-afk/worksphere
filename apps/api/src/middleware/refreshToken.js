const jwt = require('jsonwebtoken');

let refreshTokens = [];

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'worksphere_secret_key_2024',
    { expiresIn: '15m' } // قصير العمر
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'worksphere_refresh_secret_2024',
    { expiresIn: '7d' } // طويل العمر
  );
  
  return { accessToken, refreshToken };
};

const refreshAccessToken = (refreshToken) => {
  if (!refreshTokens.includes(refreshToken)) {
    throw new Error('Invalid refresh token');
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'worksphere_refresh_secret_2024');
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET || 'worksphere_secret_key_2024',
      { expiresIn: '15m' }
    );
    
    return newAccessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

module.exports = { generateTokens, refreshAccessToken, refreshTokens };