const createRateLimit = ({ windowMs, max, message }) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = requests.get(key) || [];
    const recentRequests = current.filter((timestamp) => now - timestamp < windowMs);

    if (recentRequests.length >= max) {
      return res.status(429).json({ success: false, message });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);
    next();
  };
};

module.exports = {
  createRateLimit,
};
