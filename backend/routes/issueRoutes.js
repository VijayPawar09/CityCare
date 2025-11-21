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

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    issue.statusHistory = issue.statusHistory || [];
    issue.statusHistory.push({ status, changedBy: req.user.userId, changedAt: new Date(), note: 'Admin update', actorRole: req.user.userType || req.user.role || 'admin' });
    await issue.save();

    const populated = await Issue.findById(issue._id)
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json({ message: 'Status updated', issue: populated });
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

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get issues reported by the logged-in user (citizen)
router.get('/my-issues', authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json(issues);
  } catch (err) {
    console.error('Failed to fetch my issues', err);
    res.status(500).json({ message: 'Failed to fetch my issues' });
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
    const issues = await Issue.find({ assignedTo: req.user.userId })
      .populate('reportedBy', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET issues assigned to logged-in volunteer (alias)
router.get('/my-assigned', authMiddleware, roleMiddleware(['volunteer']), async (req, res) => {
  try {
    const issues = await Issue.find({ assignedTo: req.user.userId })
      .populate('reportedBy', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned issues' });
  }
});


// PUT /api/issues/:id/status - allow assigned volunteer OR the original reporter to update status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'in-progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const requesterId = req.user.userId;

    // If user is assigned volunteer
    if (issue.assignedTo && issue.assignedTo.toString() === requesterId) {
      issue.status = status;
      issue.statusHistory = issue.statusHistory || [];
      issue.statusHistory.push({ status, changedBy: requesterId, changedAt: new Date(), note: 'Volunteer update', actorRole: req.user.userType || req.user.role || 'volunteer' });
      await issue.save();

      const populated = await Issue.findById(issue._id)
        .populate('reportedBy', 'fullName email')
        .populate('assignedTo', 'fullName email')
        .populate('statusHistory.changedBy', 'fullName email');

      return res.json({ message: 'Status updated successfully', issue: populated });
    }

    // If user is the original reporter
    if (issue.reportedBy && issue.reportedBy.toString() === requesterId) {
      issue.status = status;
      issue.statusHistory = issue.statusHistory || [];
      issue.statusHistory.push({ status, changedBy: requesterId, changedAt: new Date(), note: 'Reporter update', actorRole: req.user.userType || req.user.role || 'citizen' });
      await issue.save();

      const populated = await Issue.findById(issue._id)
        .populate('reportedBy', 'fullName email')
        .populate('assignedTo', 'fullName email')
        .populate('statusHistory.changedBy', 'fullName email');

      return res.json({ message: 'Status updated successfully', issue: populated });
    }

    // Otherwise, unauthorized
    return res.status(403).json({ message: 'You are not authorized to update this issue status' });
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
    // Basic validation and logging to avoid silent 500s
    const { title, description, category, location } = req.body;
  // Build a public URL for uploaded file so clients can fetch via HTTP
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';

    console.log('Report request body:', req.body);
    console.log('Report request file:', req.file && { originalname: req.file.originalname, path: req.file.path });

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'title, description and location are required' });
    }

    try {
      const issue = new Issue({
        title,
        description,
        category,
        location,
        image: imageUrl,
        reportedBy: req.user.userId,
      });

      // initialize status history with the reporting event
      issue.statusHistory = [
        {
          status: issue.status,
          changedBy: req.user.userId,
          changedAt: new Date(),
          note: 'Reported by user',
          actorRole: req.user.userType || req.user.role || 'citizen',
        },
      ];

      await issue.save();

      // re-fetch with populated fields to return actor names in history
      const populated = await Issue.findById(issue._id)
        .populate('reportedBy', 'fullName email')
        .populate('assignedTo', 'fullName email')
        .populate('statusHistory.changedBy', 'fullName email');

      res.status(201).json({ message: 'Issue reported successfully', issue: populated });
    } catch (err) {
      console.error('Error saving issue:', err);
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

// Get single issue by ID (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id)
      .populate('reportedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('statusHistory.changedBy', 'fullName email');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    res.json(issue);
  } catch (err) {
    console.error('Failed to fetch issue by id', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;