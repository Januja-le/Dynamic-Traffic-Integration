const User = require('../models/User');

const searchAlumni = async (req, res) => {
  try {
    const { q, domain, skills, minExp, maxExp } = req.query;
    const filter = { role: 'alumni', verificationStatus: 'approved' };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } }
      ];
    }

    if (domain) filter.domain = domain;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (minExp) filter.yearsOfExperience = { ...(filter.yearsOfExperience || {}), $gte: Number(minExp) };
    if (maxExp) filter.yearsOfExperience = { ...(filter.yearsOfExperience || {}), $lte: Number(maxExp) };

    const results = await User.find(filter)
      .select('name email profilePicture company position domain yearsOfExperience hourlyRate skills linkedin');

    return res.json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { searchAlumni };
