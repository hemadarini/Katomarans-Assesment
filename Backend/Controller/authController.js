import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../Database/db.js';

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

// Helper: Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret_key_change_this_in_production',
    { expiresIn: '15m' }
  );
};

// Helper: Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_change_this_in_production',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Form Validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const userExists = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL database
    const newUser = await query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const user = newUser.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await query('UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2', [refreshToken, user.id]);

    // Set Refresh Token as HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Send access token and user info
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Form Validation
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check user in database
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in database
    await query('UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2', [refreshToken, user.id]);

    // Set Refresh Token as HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_change_this_in_production'
    );

    // Find user by ID and check if refresh token matches
    const userRes = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];

    // Check if refresh token is the same as stored in DB (token revocation check)
    if (user.refresh_token !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Session expired or token revoked' });
    }

    // Generate new Access Token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error('Token Refresh Error:', error);
    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      // Invalidate refresh token in database
      await query('UPDATE users SET refresh_token = NULL, updated_at = NOW() WHERE refresh_token = $1', [refreshToken]);
    }

    // Clear client-side cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/profile
// @access  Private
export const profile = async (req, res) => {
  try {
    // req.user was set in verifyToken middleware
    const userRes = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: userRes.rows[0],
    });
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
