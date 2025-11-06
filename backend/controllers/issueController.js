const Issue = require('../models/Issue');

exports.reportIssue = async (req, res) => {
  const { title, description, category, location } = req.body;
  // If a file was uploaded, build a public URL for it so the frontend can fetch it over HTTP
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : req.body.imageUrl || '';

  console.log('Controller reportIssue body:', req.body);
  console.log('Controller reportIssue file:', req.file && { originalname: req.file.originalname, path: req.file.path });

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
      reportedBy: req.user.userId
    });

    await issue.save();
    console.log('Saved Issue:', issue); // Log the saved issue
    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (err) {
    console.error('Error in controller.reportIssue:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllIssues = async(req, res) => {
    try {
        const issues = await Issue.find().populate('reportedBy', 'fullName email');
        res.json(issues);
    } catch(err){
        res.status(500).json({message: err.message})
    }
};