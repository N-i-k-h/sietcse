import express from 'express';
import Class from '../models/Class.js';
import Timetable from '../models/Timetable.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get Timetable for Faculty
router.get('/faculty/:facultyId', authMiddleware, async (req, res) => {
    try {
        const { facultyId } = req.params;
        // In Mongoose facultyId is the _id in Faculty collection
        // Timetable entries store facultyId

        const timetable = await Timetable.find({ facultyId }).populate('classId', 'name section');

        // Map to frontend expectation
        const response = timetable.map(t => ({
            day_of_week: t.day,
            period_number: t.period,
            subject: t.subject,
            faculty_id: t.facultyId,
            room_number: t.roomNumber,
            class_id: t.classId?._id,
            // @ts-ignore
            class_name: t.classId?.name,
            // @ts-ignore
            section: t.classId?.section
        }));

        res.json(response);
    } catch (error) {
        console.error('Get faculty timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Timetable Entry
router.post('/', authMiddleware, roleMiddleware('admin', 'hod'), async (req, res) => {
    try {
        const { class_id, day_of_week, period_number, subject, faculty_id, room_number } = req.body;

        // Mongoose ids are strict. Ensure class_id and faculty_id are valid objectIds is good practice.
        // Assuming they are passed correctly.

        // Check conflicts
        const existing = await Timetable.findOne({
            classId: class_id,
            day: day_of_week,
            period: period_number
        });

        if (existing) {
            // Update
            existing.subject = subject;
            existing.facultyId = faculty_id;
            existing.roomNumber = room_number;
            await existing.save();
            return res.json({ message: 'Timetable updated' });
        }

        const newEntry = await Timetable.create({
            classId: class_id,
            day: day_of_week,
            period: period_number,
            subject,
            facultyId: faculty_id,
            roomNumber: room_number
        });

        res.status(201).json({ id: newEntry._id, message: 'Timetable entry created' });

    } catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
