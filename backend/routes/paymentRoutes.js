const express = require('express');
const router = express.Router();

// Logic is currently handled in orderRoutes for atomic order creation + payment init
// This file is reserved for future standalone payment features (e.g. refunds, webhooks)

module.exports = router;
