import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all faculty
router.get('/', async (req, res) => {
    try {
        const faculty = await Faculty.find().populate('user', 'email role isActive');
        // Transform for frontend if needed or send as is
        // Frontend expects: id, name, email, designation, subjects[], etc.
        const response = faculty.map(f => ({
            id: f._id,
            name: `${f.firstName} ${f.lastName}`,
            firstName: f.firstName,
            lastName: f.lastName,
            email: f.user ? f.user.email : 'N/A', // Mongoose populate types are tricky without TS
            designation: f.designation,
            department: 'CSE', // Hardcoded for now
            experienceTotal: f.education?.experience || 0,
            experienceResearch: 0,
            highestDegree: f.education?.highestDegree,
            phone: f.phone,
            subjects: f.subjects || []
        }));
        res.json(response);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Faculty
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        console.log('Received faculty create request:', req.body);
        const { firstName, lastName, email, phone, designation, highestDegree, experience, experienceTotal, role } = req.body;

        // Check user existence
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create User
        // Default password: staff123
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('staff123', salt);

        // Determine role: Use provided role if available, otherwise guess from designation
        const userRole = role === 'hod' ? 'hod' : (designation === 'HOD' ? 'hod' : 'staff');

        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: userRole,
            department: 'CSE'
        });

        // Map experienceTotal (from frontend) to experience (in schema) if experience is missing
        const finalExperience = experience || experienceTotal || 0;

        // Create Faculty Profile
        const newFaculty = await Faculty.create({
            user: newUser._id,
            firstName,
            lastName,
            designation,
            phone,
            education: {
                highestDegree,
                experience: finalExperience
            },
            subjects: []
        });

        res.status(201).json({
            message: 'Faculty created successfully',
            id: newFaculty._id
        });

    } catch (error) {
        console.error('Create faculty error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Delete Faculty
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

        // Delete associated User
        await User.findByIdAndDelete(faculty.user);

        // Delete Faculty Profile
        await Faculty.findByIdAndDelete(faculty._id);

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
