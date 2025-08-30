const express = require('express');
const { getTodayHoroscope, getHoroscopeHistory, getHoroscopeByDate } = require('../controllers/horoscopeController');
const authenticate = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/horoscope/today:
 *   get:
 *     summary: Get today's horoscope
 *     tags: [Horoscope]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's horoscope retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     horoscope:
 *                       $ref: '#/components/schemas/Horoscope'
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/today', authenticate, apiLimiter, getTodayHoroscope);

/**
 * @swagger
 * /api/horoscope/history:
 *   get:
 *     summary: Get 7-day horoscope history
 *     tags: [Horoscope]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Horoscope history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     horoscopes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Horoscope'
 *                     zodiacInfo:
 *                       type: object
 *                     totalCount:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/history', authenticate, apiLimiter, getHoroscopeHistory);

/**
 * @swagger
 * /api/horoscope/date/{date}:
 *   get:
 *     summary: Get horoscope for specific date
 *     tags: [Horoscope]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2023-12-25
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Horoscope for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     horoscope:
 *                       $ref: '#/components/schemas/Horoscope'
 *       400:
 *         description: Invalid date format
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/date/:date', authenticate, apiLimiter, getHoroscopeByDate);

module.exports = router;
