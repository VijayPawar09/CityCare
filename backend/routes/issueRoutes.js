const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { reportIssue, getAllIssues } = require('../controllers/issueController');
const Issue = require('../models/Issue');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Admin can update any issue status
router.patch('/update-status/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'in-progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Status updated', issue: updatedIssue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List issues (optionally filtered)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/assign', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { volunteerId } = req.body;

  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.assignedTo = volunteerId;
    await issue.save();

    res.json({ message: 'Volunteer assigned successfully', issue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Volunteer: Get issues assigned to them
router.get('/assigned/me', authMiddleware, roleMiddleware(['volunteer']), async (req, res) => {
  try {
    const issues = await Issue.find({ assignedTo: req.user.userId }).populate('reportedBy', 'fullName email');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET issues assigned to logged-in volunteer (alias)
router.get('/my-assigned', authMiddleware, roleMiddleware(['volunteer']), async (req, res) => {
  try {
    const issues = await Issue.find({ assignedTo: req.user.userId });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned issues' });
  }
});


//PUT/api/issues/:id/status - volunteer updates issues status
router.put('/:id/status', authMiddleware, roleMiddleware(['volunteer']), async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'in-progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (issue.assignedTo?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not assigned to this issue' });
    }

    issue.status = status;
    await issue.save();

    res.json({ message: 'Status updated successfully', issue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

router.get('/all/filter', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { status, assignedTo, reportedBy } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

//POST api/issues/report with image upload:
router.post(
  '/report',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    const { title, description, category, location } = req.body;
    const imageUrl = req.file ? req.file.path : '';

    try {
      const issue = new Issue({
        title,
        description,
        category,
        location,
        image: imageUrl,
        reportedBy: req.user.userId,
      });

      await issue.save();
      res.status(201).json({ message: 'Issue reported successfully', issue });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


router.get(
  '/stats',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const pending = await Issue.countDocuments({ status: 'pending' });
      const inProgress = await Issue.countDocuments({ status: 'in-progress' });
      const resolved = await Issue.countDocuments({ status: 'resolved' });

      res.json({ pending, inProgress, resolved });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  }
);

module.exports = router;