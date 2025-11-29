// @ts-nocheck
const express = require('express');
const codeEvaluationController = require('../controllers/codeEvaluation.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/code-evaluation/evaluate
 * @desc Evaluate student code against test cases using Judge0
 * @access Private (requires authentication)
 */
router.post('/evaluate', authMiddleware.authenticateToken, codeEvaluationController.evaluateCodingQuestion);

module.exports = router;