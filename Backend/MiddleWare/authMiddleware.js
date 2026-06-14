import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token missing' 
    });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_change_this_in_production', (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          tokenExpired: true, 
          message: 'Access token expired' 
        });
      }
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid access token' 
      });
    }

    req.user = decoded; // Contains id, email, name
    next();
  });
};
