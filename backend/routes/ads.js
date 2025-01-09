const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
router.get('/ads-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const ads = JSON.parse(fs.readFileSync(path.join(__dirname, '../ads/adv.json')));

    let index = 0;

    const interval = setInterval(() => {
        const ad = ads[index];
        res.write(`data: ${JSON.stringify(ad)}\n\n`);
        index = (index + 1) % ads.length; 
    }, 50000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

module.exports = router;