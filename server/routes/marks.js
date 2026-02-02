import express from 'express';
import Marks from '../models/Marks.js';
import whatsappService from '../services/whatsappService.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Add Marks
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { student_id, subject, exam_type, marks_obtained, max_marks, exam_date, send_notification } = req.body;

        const newMarks = await Marks.create({
            studentId: student_id,
            subject,
            examType: exam_type,
            marksObtained: marks_obtained,
            maxMarks: max_marks,
            examDate: exam_date || new Date()
        });

        res.status(201).json({
            message: 'Marks added',
            id: newMarks._id
            // Notification logic here
        });

    } catch (error) {
        console.error('Add marks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
