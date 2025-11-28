// @ts-nocheck
const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const resultsService = require('../services/ResultsService');

const router = express.Router();

// All results routes are protected by authentication
// Some routes require specific roles

// Save assessment result (student)
router.post('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Save Assessment Result Request ===');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        
        const resultData = {
            ...req.body,
            studentId: req.user.sub || req.user.username,
            studentEmail: req.user.email,
            studentName: req.user.name || `${req.user.given_name || ''} ${req.user.family_name || ''}`.trim() || req.user.email
        };
        
        const result = await resultsService.saveAssessmentResult(resultData);
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error saving assessment result:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save assessment result'
        });
    }
});

// Get student's results (student)
router.get('/my-results', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Student Results Request ===');
        console.log('User:', req.user);
        
        const studentId = req.user.sub || req.user.username;
        const results = await resultsService.getStudentResults(studentId);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Error fetching student results:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch student results'
        });
    }
});

// Get specific assessment result (student)
router.get('/my-results/:assessmentId', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Student Assessment Result Request ===');
        console.log('User:', req.user);
        console.log('Params:', req.params);
        
        const { assessmentId } = req.params;
        const studentId = req.user.sub || req.user.username;
        const results = await resultsService.getStudentResults(studentId, assessmentId);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Error fetching student assessment result:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch student assessment result'
        });
    }
});

// Get all results for an assessment (instructor/admin)
router.get('/assessment/:assessmentId', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Assessment Results Request ===');
        console.log('User:', req.user);
        console.log('Params:', req.params);
        
        const { assessmentId } = req.params;
        const results = await resultsService.getAssessmentResults(assessmentId);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error('Error fetching assessment results:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch assessment results'
        });
    }
});

// Get student's rank in an assessment (student)
router.get('/rank/:assessmentId', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Student Rank Request ===');
        console.log('User:', req.user);
        console.log('Params:', req.params);
        
        const { assessmentId } = req.params;
        const studentId = req.user.sub || req.user.username;
        const rankData = await resultsService.getStudentRank(assessmentId, studentId);
        
        res.status(200).json({
            success: true,
            data: rankData
        });
    } catch (error: any) {
        console.error('Error fetching student rank:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch student rank'
        });
    }
});

// Get department statistics for an assessment (instructor/admin)
router.get('/department-stats/:assessmentId', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Department Stats Request ===');
        console.log('User:', req.user);
        console.log('Params:', req.params);
        
        const { assessmentId } = req.params;
        const stats = await resultsService.getDepartmentStats(assessmentId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch department stats'
        });
    }
});

// Get top performers for an assessment (instructor/admin)
router.get('/top-performers/:assessmentId', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Top Performers Request ===');
        console.log('User:', req.user);
        console.log('Params:', req.params);
        
        const { assessmentId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const topPerformers = await resultsService.getTopPerformers(assessmentId, limit);
        
        res.status(200).json({
            success: true,
            data: topPerformers
        });
    } catch (error: any) {
        console.error('Error fetching top performers:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch top performers'
        });
    }
});

module.exports = router;