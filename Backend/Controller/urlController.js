import crypto from 'crypto';
import { query } from '../Database/db.js';

// Helper: Parse user agent into simple Browser and Device categories
const parseUserAgent = (uaString) => {
  if (!uaString) return { browser: 'Unknown', device: 'Desktop' };
  
  let browser = 'Other';
  let device = 'Desktop';
  
  // Device classification
  if (/mobi|android|iphone|ipad|ipod/i.test(uaString)) {
    device = 'Mobile';
    if (/ipad/i.test(uaString)) {
      device = 'Tablet';
    }
  }
  
  // Browser classification
  if (/chrome|crios/i.test(uaString) && !/edge|edg/i.test(uaString) && !/opr|opera/i.test(uaString)) {
    browser = 'Chrome';
  } else if (/safari/i.test(uaString) && !/chrome|crios/i.test(uaString)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(uaString)) {
    browser = 'Firefox';
  } else if (/edge|edg/i.test(uaString)) {
    browser = 'Edge';
  } else if (/opr|opera/i.test(uaString)) {
    browser = 'Opera';
  }
  
  return { browser, device };
};

// Helper: Generate a random 6-character alphanumeric code
const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(bytes[i] % chars.length);
  }
  return code;
};

// Helper: Check if a URL string is valid
const isValidUrl = (urlStr) => {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// @desc    Shorten a URL
// @route   POST /api/urls/shorten
// @access  Private
export const shorten = async (req, res) => {
  const { originalUrl, expiresAt } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ success: false, message: 'Please provide a URL to shorten' });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ success: false, message: 'Invalid URL. Please make sure to include http:// or https://' });
  }

  try {
    let shortCode;
    let isUnique = false;
    let attempts = 0;

    // Loop to ensure uniqueness and prevent collision
    while (!isUnique && attempts < 10) {
      shortCode = generateShortCode();
      const codeCheck = await query('SELECT id FROM urls WHERE short_code = $1', [shortCode]);
      if (codeCheck.rows.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ success: false, message: 'Failed to generate a unique short code. Please try again.' });
    }

    // Format Expiry date
    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;
    if (parsedExpiresAt && parsedExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Expiration date cannot be in the past' });
    }

    // Insert into PostgreSQL
    const insertRes = await query(
      'INSERT INTO urls (user_id, original_url, short_code, expires_at) VALUES ($1, $2, $3, $4) RETURNING id, original_url, short_code, clicks, expires_at, created_at',
      [req.user.id, originalUrl.trim(), shortCode, parsedExpiresAt]
    );

    const newUrl = insertRes.rows[0];
    const host = req.get('host');
    const shortUrl = `${req.protocol}://${host}/s/${newUrl.short_code}`;

    res.status(201).json({
      success: true,
      message: 'URL shortened successfully',
      data: {
        id: newUrl.id,
        originalUrl: newUrl.original_url,
        shortCode: newUrl.short_code,
        shortUrl,
        clicks: newUrl.clicks,
        expiresAt: newUrl.expires_at,
        createdAt: newUrl.created_at,
      },
    });
  } catch (error) {
    console.error('URL Shortening Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Get all shortened URLs for the logged-in user
// @route   GET /api/urls
// @access  Private
export const getUserUrls = async (req, res) => {
  try {
    const urlsRes = await query(
      'SELECT id, original_url, short_code, clicks, expires_at, created_at FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const host = req.get('host');
    const formattedUrls = urlsRes.rows.map((row) => ({
      id: row.id,
      originalUrl: row.original_url,
      shortCode: row.short_code,
      shortUrl: `${req.protocol}://${host}/s/${row.short_code}`,
      clicks: row.clicks,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }));

    res.status(200).json({
      success: true,
      urls: formattedUrls,
    });
  } catch (error) {
    console.error('Fetch URLs Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Delete a shortened URL
// @route   DELETE /api/urls/:id
// @access  Private
export const deleteUrl = async (req, res) => {
  const urlId = req.params.id;

  try {
    const deleteRes = await query(
      'DELETE FROM urls WHERE id = $1 AND user_id = $2 RETURNING id',
      [urlId, req.user.id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Shortened URL deleted successfully',
    });
  } catch (error) {
    console.error('Delete URL Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};

// @desc    Redirect short code to original URL
// @route   GET /s/:shortCode
// @access  Public
export const redirectUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Query original URL and Expiry Status
    const urlRes = await query('SELECT id, original_url, expires_at FROM urls WHERE short_code = $1', [shortCode]);
    
    if (urlRes.rows.length === 0) {
      return res.status(404).send('<h1>404 Not Found</h1><p>The shortened URL does not exist or has been deleted.</p>');
    }

    const { id, original_url, expires_at } = urlRes.rows[0];

    // Check link expiration
    if (expires_at && new Date() > new Date(expires_at)) {
      return res.status(410).send(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background-color: #0F172A; color: #F1F5F9; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
          <div style="width: 70px; height: 70px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #EF4444; font-size: 32px; font-weight: bold; margin-bottom: 24px;">!</div>
          <h1 style="color: #F1F5F9; font-size: 32px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.025em;">Link Expired</h1>
          <p style="color: #94A3B8; font-size: 16px; max-width: 420px; margin: 0 0 32px 0; line-height: 1.6;">This shortened link reached its expiration timeline on ${new Date(expires_at).toLocaleString()} and has been archived.</p>
          <div style="font-size: 12px; color: #475569;">Katomarn URL Redirector Server</div>
        </div>
      `);
    }

    // Classify user agent for analytics profiling
    const userAgentStr = req.headers['user-agent'];
    const { browser, device } = parseUserAgent(userAgentStr);

    // Increment click count
    await query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [id]);

    // Insert visit analytics log record
    await query('INSERT INTO visits (url_id, browser, device) VALUES ($1, $2, $3)', [id, browser, device]);

    // Perform the redirect
    res.redirect(original_url);
  } catch (error) {
    console.error('Redirect URL Error:', error);
    res.status(500).send('<h1>Server Error</h1><p>Failed to load the target URL.</p>');
  }
};

// @desc    Get analytics report for a specific shortened URL
// @route   GET /api/urls/:id/analytics
// @access  Private
export const getUrlAnalytics = async (req, res) => {
  const urlId = req.params.id;

  try {
    // Verify ownership and get URL details
    const urlRes = await query(
      'SELECT id, original_url, short_code, clicks, expires_at, created_at FROM urls WHERE id = $1 AND user_id = $2',
      [urlId, req.user.id]
    );

    if (urlRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    const url = urlRes.rows[0];

    // Get recent 50 visits with metadata logs
    const visitsRes = await query(
      'SELECT browser, device, clicked_at FROM visits WHERE url_id = $1 ORDER BY clicked_at DESC LIMIT 50',
      [urlId]
    );

    // Get browser group stats count
    const browserRes = await query(
      'SELECT browser, COUNT(*) as count FROM visits WHERE url_id = $1 GROUP BY browser ORDER BY count DESC',
      [urlId]
    );

    // Get device group stats count
    const deviceRes = await query(
      'SELECT device, COUNT(*) as count FROM visits WHERE url_id = $1 GROUP BY device ORDER BY count DESC',
      [urlId]
    );

    const host = req.get('host');
    const shortUrl = `${req.protocol}://${host}/s/${url.short_code}`;

    res.status(200).json({
      success: true,
      data: {
        id: url.id,
        originalUrl: url.original_url,
        shortCode: url.short_code,
        shortUrl,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
        totalClicks: url.clicks,
        lastVisited: visitsRes.rows[0] ? visitsRes.rows[0].clicked_at : null,
        recentVisits: visitsRes.rows.map((row) => ({
          clickedAt: row.clicked_at,
          browser: row.browser,
          device: row.device,
        })),
        browserStats: browserRes.rows.map((row) => ({
          browser: row.browser,
          count: parseInt(row.count, 10),
        })),
        deviceStats: deviceRes.rows.map((row) => ({
          device: row.device,
          count: parseInt(row.count, 10),
        })),
      },
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error, please try again' });
  }
};
