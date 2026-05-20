const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// ── GET /api/students ─────────────────────────────────────────────────
// Returns all students (password excluded by toJSON)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    console.error('GET /students error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
});

// ── POST /api/students ────────────────────────────────────────────────
// Create a new student record
router.post('/', async (req, res) => {
  try {
    const { fullname, school, level, email, password, paymentMethod, acceptedTerms } = req.body;

    // Check for duplicate email
    const existing = await Student.findOne({ email: email?.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const student = await Student.create({
      fullname,
      school,
      level,
      email,
      password,
      paymentMethod,
      acceptedTerms,
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    console.error('POST /students error:', err);
    res.status(500).json({ success: false, error: 'Failed to save student' });
  }
});

// ── DELETE /api/students/:id ──────────────────────────────────────────
// Delete a single student by MongoDB _id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted', id: req.params.id });
  } catch (err) {
    console.error('DELETE /students/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
});

module.exports = router;
