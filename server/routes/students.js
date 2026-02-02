import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all students (with filters)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { year, semester, section } = req.query;
        let query = {};

        if (year) query.year = year;
        if (semester) query.semester = semester;
        if (section) query.section = section;

        const students = await Student.find(query).populate('user', 'email');

        const response = students.map(s => ({
            id: s._id,
            name: `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.user ? s.user.email : 'N/A', // Assuming populate works
            usn: s.usn,
            year: s.year,
            semester: s.semester,
            section: s.section,
            phone: s.phone,
            parentName: s.parentName,
            parentPhone: s.parentPhone
        }));

        res.json(response);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Student
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), async (req, res) => {
    try {
        const { firstName, lastName, email, usn, phone, parentName, parentPhone, year, semester, section } = req.body;

        // Check duplicates
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'Email already exists' });

        const usnExists = await Student.findOne({ usn });
        if (usnExists) return res.status(400).json({ error: 'USN already exists' });

        // Create User
        // Default password: student123 or usn
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(usn.toUpperCase(), salt); // Password is USN

        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: 'student',
            department: 'CSE'
        });

        const newStudent = await Student.create({
            user: newUser._id,
            usn: usn.toUpperCase(),
            firstName,
            lastName,
            phone,
            parentName,
            parentPhone,
            year,
            semester,
            section: section.toUpperCase()
        });

        res.status(201).json({
            message: 'Student created successfully',
            id: newStudent._id
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Student
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(student._id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
