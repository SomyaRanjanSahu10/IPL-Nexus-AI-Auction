const User = require('../models/User');
const Team = require('../models/Team');
const { generateToken } = require('../middleware/authMiddleware');

const attachOwnedTeam = async (user, fields) => {
  if (!user || user.team || user.role !== 'team_owner') return user?.team || null;

  const team = await Team.findOne({ owner: user._id }).select(fields);
  if (team) {
    user.team = team;
    await User.updateOne({ _id: user._id }, { $set: { team: team._id } });
  }
  return team;
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, teamId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let teamRef = null;
    if (role === 'team_owner' && teamId) {
      const team = await Team.findById(teamId);
      if (!team) return res.status(400).json({ error: 'Team not found' });
      if (team.owner) return res.status(400).json({ error: 'Team already has an owner' });
      teamRef = teamId;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'admin' ? 'viewer' : (role || 'viewer'), // admins created via seed only
      team: teamRef
    });

    if (teamRef) {
      await Team.findByIdAndUpdate(teamId, { owner: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('team', 'name shortName primaryColor emoji purseRemaining');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated. Contact admin.' });
    }

    const team = await attachOwnedTeam(user, 'name shortName primaryColor emoji purseRemaining');

    // Update last login using updateOne — avoids triggering pre-save password re-hash
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() }, $inc: { loginCount: 1 } }
    );

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: team || user.team
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('team', 'name shortName primaryColor emoji purseRemaining overseasCount stats');
    await attachOwnedTeam(user, 'name shortName primaryColor emoji purseRemaining overseasCount stats');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/users (admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('team', 'name shortName')
      .sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, getUsers };
