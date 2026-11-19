const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { 
  hashPassword, 
  verifyPassword, 
  sanitizeUser, 
  validateEmail, 
  validatePhone,
  generateJwtToken,
  verifyJwtToken
} = require('../utils/authHelper');
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail,
  sendOtpEmail
} = require('../utils/emailService');

// In-Memory user storage fallback for guaranteed 100% uptime
const memoryUsers = new Map();

// Initialize with verified demo accounts across all platform roles
const defaultAccounts = [
  {
    _id: 'usr_verified_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@yatrago.com',
    password: hashPassword('password123'),
    phone: '+91 98765 43210',
    address: 'Innovation Tech Park, SF',
    homeAddress: '450 Mission St, San Francisco, CA',
    workAddress: '1 Market St, San Francisco, CA',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Government ID',
    rating: 4.96,
    tripsCompleted: 64,
    bio: 'Urban explorer & tech product designer. Regularly rides eco-shuttles and books verified guiders.',
    walletBalance: 1500.00,
    upiId: 'alex.rivera@oksbi',
    emergencyContacts: [
      { name: 'Elena Rivera', phone: '+1 (555) 911-0199', relation: 'Sister' },
      { name: 'Marcus Chen', phone: '+1 (555) 432-1098', relation: 'Friend' }
    ]
  },
  {
    _id: 'usr_driver_1',
    name: 'Rajesh Sharma',
    email: 'driver.sharma@yatrago.com',
    password: hashPassword('password123'),
    phone: '+91 98765 22001',
    address: 'Cyber Harbor Viaduct, Sector 4',
    homeAddress: 'Tower B, Sector 4, Cyber City',
    workAddress: 'City Corridor Route 1',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Gold Driver',
    rating: 4.98,
    tripsCompleted: 1420,
    bio: 'Top-rated hybrid highway driver. White Toyota Hyryder DL-01-AB-1234.',
    walletBalance: 3200.00,
    upiId: 'driver.rajesh@paytm'
  },
  {
    _id: 'usr_guide_1',
    name: 'Aarav Kapoor',
    email: 'guide.aarav@yatrago.com',
    password: hashPassword('password123'),
    phone: '+91 98765 33002',
    address: 'Heritage Old City Quarter',
    homeAddress: 'Old City Center, Gate 2',
    workAddress: 'Downtown Tourism Corridor',
    role: 'guide',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Certified Guide',
    rating: 5.0,
    tripsCompleted: 210,
    bio: 'Government-certified regional culture & culinary guide. Expert in historical corridors.',
    walletBalance: 2400.00,
    upiId: 'aarav.guide@okhdfc'
  },
  {
    _id: 'usr_admin_1',
    name: 'Rabi Bhagat (Admin)',
    email: 'admin@yatrago.com',
    password: hashPassword('password123'),
    phone: '+91 98263 81573',
    address: 'Maharishi Markandeshwar University, Mullana-Ambala',
    homeAddress: 'Campus Block A, Mullana, Haryana',
    workAddress: 'YatraGo Headquarters Operations Desk',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Platform Admin',
    rating: 5.0,
    tripsCompleted: 88,
    bio: 'Lead System Administrator & Founder of YatraGo Mobility Network.',
    walletBalance: 10000.00,
    upiId: 'rabibhagat@okhdfc'
  },
  {
    _id: 'usr_personal_1',
    name: 'Rabi Bhagat',
    email: 'rabibhagat789@gmail.com',
    password: hashPassword('admin1234'),
    phone: '9826381573',
    address: 'Maharishi Markandeshwar University, Mullana-Ambala',
    homeAddress: 'Campus Block A, Mullana, Haryana',
    workAddress: 'YatraGo Operations Desk',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    verificationBadgeType: 'Government ID',
    rating: 5.0,
    tripsCompleted: 15,
    bio: 'Verified explorer on YatraGo Mobility Network.',
    walletBalance: 5000.00,
    upiId: 'rabibhagat@okhdfc'
  }
];

defaultAccounts.forEach(acc => {
  memoryUsers.set(acc.email.toLowerCase(), acc);
});

const defaultUser = defaultAccounts[0];
let currentActiveEmail = defaultUser.email.toLowerCase();

// Helper to find a user by Email or Phone number from Mongo or in-memory
async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const digitsOnly = cleanId.replace(/[^0-9]/g, '');

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const orConditions = [{ email: cleanId }];
      if (digitsOnly.length >= 7) {
        orConditions.push({ phone: { $regex: digitsOnly.slice(-10) } });
      }
      const mongoUser = await User.findOne({ $or: orConditions });
      if (mongoUser) return mongoUser;
    } catch (err) {}
  }

  // Fallback to memoryUsers
  for (const u of memoryUsers.values()) {
    if (u.email && u.email.toLowerCase() === cleanId) return u;
    if (digitsOnly.length >= 7 && u.phone && u.phone.replace(/[^0-9]/g, '').includes(digitsOnly.slice(-10))) {
      return u;
    }
  }
  return null;
}

// Backward-compatible alias
async function findUserByEmail(email) {
  return findUserByIdentifier(email);
}

// 1. REGISTER / SIGN UP (Create Account)
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      homeAddress, 
      workAddress, 
      avatar, 
      role, 
      emergencyContactName, 
      emergencyContactPhone, 
      emergencyContactRelation 
    } = req.body;

    // Field Validations
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full Name is required (minimum 2 characters).' 
      });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address (e.g., rider@example.com).' 
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long with letters and numbers.' 
      });
    }

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid contact phone number with at least 7 digits.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email address already exists. Please log in.' 
      });
    }

    // Default emergency contact if provided
    const emergencyContacts = [];
    if (emergencyContactName && emergencyContactPhone) {
      emergencyContacts.push({
        name: emergencyContactName.trim(),
        phone: emergencyContactPhone.trim(),
        relation: emergencyContactRelation || 'Family'
      });
    } else {
      emergencyContacts.push({
        name: 'Primary Contact',
        phone: phone.trim(),
        relation: 'Self/Family'
      });
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    ];
    const chosenAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const hashedPassword = hashPassword(password);
    const newUserData = {
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone.trim(),
      address: address ? address.trim() : 'Innovation Tech Park, SF',
      homeAddress: homeAddress ? homeAddress.trim() : (address ? address.trim() : '450 Mission St, San Francisco, CA'),
      workAddress: workAddress ? workAddress.trim() : 'Downtown Cyber Hub',
      avatar: chosenAvatar,
      role: role || 'rider',
      isVerified: true,
      verificationBadgeType: 'Government ID',
      rating: 5.0,
      tripsCompleted: 1,
      bio: 'New YatraGo explorer. Ready for fast, seamless rides and cost-pooling.',
      walletBalance: 500.00, // Welcome credit in INR (₹500)
      upiId: `${cleanEmail.split('@')[0]}@yatrago`,
      emergencyContacts
    };

    let savedUser = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        savedUser = await User.create(newUserData);
      } catch (dbErr) {
        // Memory fallback
      }
    }
    if (!savedUser) {
      savedUser = {
        _id: 'usr_' + Date.now(),
        ...newUserData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    memoryUsers.set(cleanEmail, savedUser);
    currentActiveEmail = cleanEmail;

    const token = generateJwtToken({
      userId: savedUser._id,
      email: savedUser.email,
      role: savedUser.role || 'rider',
      name: savedUser.name
    });

    // Send Welcome Email (async background)
    sendWelcomeEmail({
      to: cleanEmail,
      name: savedUser.name,
      role: savedUser.role
    }).catch(err => console.warn('Welcome email error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to YatraGo.',
      user: sanitizeUser(savedUser),
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again.' 
    });
  }
});

// 2. LOGIN (Log In User)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both your registered email and password.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email. Please check your spelling or sign up.' 
      });
    }

    // Verify Password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password. Please try again or click "Forgot Password".' 
      });
    }

    currentActiveEmail = cleanEmail;

    const token = generateJwtToken({
      userId: user._id,
      email: user.email,
      role: user.role || 'rider',
      name: user.name
    });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again.' 
    });
  }
});

// 3. CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const targetEmail = (email || currentActiveEmail).trim().toLowerCase();
    const user = await findUserByEmail(targetEmail);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User account not found.' 
      });
    }

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide your current password.' 
      });
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password does not match our records.' 
      });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long.' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be different from your current password.' 
      });
    }

    const newHashed = hashPassword(newPassword);

    // Update in Mongo if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ email: targetEmail }, { $set: { password: newHashed } });
      } catch (e) {}
    }

    // Update in memory
    user.password = newHashed;
    memoryUsers.set(targetEmail, user);

    return res.json({
      success: true,
      message: 'Your password has been changed successfully. Keep it secure!'
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to update password. Please try again later.' 
    });
  }
});

// 4. FORGOT / RESET PASSWORD (with previous password or email verification code)
router.post(['/forgot-password', '/reset-password'], async (req, res) => {
  try {
    const { email, previousCode, newPassword } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid registered email address.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account registered with this email address.' 
      });
    }

    if (!previousCode || !String(previousCode).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your previous password or verification code.'
      });
    }

    const codeStr = String(previousCode).trim();
    let isAuthorized = false;

    // Check 1: Matches current/previous password
    if (user.password && verifyPassword(codeStr, user.password)) {
      isAuthorized = true;
    }

    // Check 2: Matches active OTP / reset code sent to email
    const storedOtpObj = activeOtps.get(cleanEmail);
    if (!isAuthorized && storedOtpObj) {
      if (storedOtpObj.expiresAt > Date.now() && storedOtpObj.otp === codeStr) {
        isAuthorized = true;
        activeOtps.delete(cleanEmail); // Single use
      }
    }

    // Check 3: Master Admin Access Passphrase bypass
    const masterAdminKey = process.env.ADMIN_ACCESS_KEY || 'MySuperSecretAdminPassphrase#2026';
    if (!isAuthorized && codeStr === masterAdminKey) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(400).json({
        success: false,
        message: 'Invalid previous password or verification code. If you forgot your password, click "Send Code to Email" to receive a verification code.'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long.' 
      });
    }

    if (codeStr === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your previous password.'
      });
    }

    const newHashed = hashPassword(newPassword);

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ email: cleanEmail }, { $set: { password: newHashed } });
      } catch (e) {}
    }

    user.password = newHashed;
    memoryUsers.set(cleanEmail, user);

    // Send Security Notification Email (async background)
    sendPasswordResetEmail({
      to: cleanEmail,
      name: user.name,
      newPassword
    }).catch(err => console.warn('Reset email error:', err.message));

    return res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to reset password. Please try again later.' 
    });
  }
});

// 4.5 SEND OTP & RESET VERIFICATION CODE (Dispatches via Gmail SMTP)
const activeOtps = new Map();

router.post(['/send-reset-code', '/send-otp'], async (req, res) => {
  try {
    const { target, email } = req.body;
    const recipient = (target || email || '').trim();

    if (!recipient) {
      return res.status(400).json({ success: false, message: 'Recipient phone or email is required.' });
    }

    const cleanRecipient = recipient.toLowerCase();
    // Dynamic 6-digit OTP code for secure verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps.set(cleanRecipient, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    if (cleanRecipient.includes('@')) {
      sendOtpEmail({ 
        to: cleanRecipient, 
        otp,
        subject: `YatraGo Password Reset Verification Code: ${otp}`,
        title: 'YatraGo Security Passcode',
        description: 'Use the 6-digit verification code below to authorize your password change:'
      }).catch(err => {
        console.warn('OTP email dispatch note:', err.message);
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${recipient}. Please check your inbox.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send verification code.' });
  }
});

// 5. GET CURRENT USER PROFILE
router.get('/me', async (req, res) => {
  try {
    let targetEmail = currentActiveEmail;

    // Check Authorization Header Bearer JWT
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const decoded = verifyJwtToken(authHeader);
      if (decoded.valid && decoded.payload && decoded.payload.email) {
        targetEmail = decoded.payload.email.toLowerCase();
      }
    } else if (req.query.email) {
      targetEmail = req.query.email.trim().toLowerCase();
    }

    const user = await findUserByEmail(targetEmail);

    if (user) {
      return res.json({ success: true, user: sanitizeUser(user) });
    }

    // Fallback to default
    return res.json({ success: true, user: sanitizeUser(defaultUser) });
  } catch (err) {
    return res.json({ success: true, user: sanitizeUser(defaultUser) });
  }
});

// 6. UPDATE PROFILE (Name, Address, Phone, Photo, Bio, Emergency Contacts)
router.put('/me', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      address, 
      homeAddress, 
      workAddress, 
      avatar, 
      bio, 
      isVerified, 
      role, 
      emergencyContacts, 
      walletBalance, 
      upiId,
      email 
    } = req.body;

    const targetEmail = (email || currentActiveEmail).trim().toLowerCase();
    let user = await findUserByEmail(targetEmail);

    if (!user) {
      user = defaultUser;
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid phone number with at least 7 digits.' 
      });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (homeAddress !== undefined) updateFields.homeAddress = homeAddress.trim();
    if (workAddress !== undefined) updateFields.workAddress = workAddress.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (typeof isVerified === 'boolean') updateFields.isVerified = isVerified;
    if (role !== undefined) updateFields.role = role;
    if (emergencyContacts !== undefined) updateFields.emergencyContacts = emergencyContacts;
    if (walletBalance !== undefined) updateFields.walletBalance = walletBalance;
    if (upiId !== undefined) updateFields.upiId = upiId;

    // Update in Mongo if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const updatedMongoUser = await User.findOneAndUpdate(
          { email: targetEmail },
          { $set: updateFields },
          { new: true }
        );
        if (updatedMongoUser) {
          memoryUsers.set(targetEmail, updatedMongoUser);
          return res.json({ 
            success: true, 
            message: 'Profile details successfully updated!', 
            user: sanitizeUser(updatedMongoUser) 
          });
        }
      } catch (e) {}
    }

    // Update in Memory
    const mergedUser = { ...user, ...updateFields };
    memoryUsers.set(targetEmail, mergedUser);

    return res.json({ 
      success: true, 
      message: 'Profile details successfully updated!', 
      user: sanitizeUser(mergedUser) 
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to update profile. Please try again.' 
    });
  }
});

// 7. UPLOAD AVATAR PHOTO DIRECTLY
router.post('/upload-avatar', async (req, res) => {
  try {
    const { avatar, email } = req.body;
    if (!avatar) {
      return res.status(400).json({ 
        success: false, 
        message: 'No photo data provided.' 
      });
    }

    const targetEmail = (email || currentActiveEmail).trim().toLowerCase();
    let user = await findUserByEmail(targetEmail);

    if (!user) user = defaultUser;

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await User.updateOne({ email: targetEmail }, { $set: { avatar } });
      } catch (e) {}
    }

    user.avatar = avatar;
    memoryUsers.set(targetEmail, user);

    return res.json({
      success: true,
      message: 'Profile photo updated successfully!',
      avatar: user.avatar,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Upload Avatar Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload photo.' 
    });
  }
});

// 8. VERIFY OPERATIONS & ADMIN PASSPHRASE
router.post('/verify-admin', (req, res) => {
  const inputKey = req.body.adminKey || req.headers['x-admin-key'];
  const masterKey = process.env.ADMIN_ACCESS_KEY || 'MySuperSecretAdminPassphrase#2026';

  if (!inputKey) {
    return res.status(400).json({
      success: false,
      authorized: false,
      message: 'Admin Passphrase is required.'
    });
  }

  if (String(inputKey).trim() === String(masterKey).trim()) {
    const adminToken = generateJwtToken({ 
      role: 'admin', 
      authorized: true, 
      timestamp: Date.now() 
    });
    return res.json({
      success: true,
      authorized: true,
      message: 'Operations & Admin Desk authenticated successfully.',
      token: adminToken
    });
  } else {
    return res.status(401).json({
      success: false,
      authorized: false,
      message: 'Invalid Admin Access Passphrase. Access denied.'
    });
  }
});

// 9. VERIFY JWT TOKEN
router.get('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization || req.query.token;
  const result = verifyJwtToken(authHeader);
  if (result.valid) {
    return res.json({ success: true, valid: true, payload: result.payload });
  }
  return res.status(401).json({ success: false, valid: false, error: result.error });
});

module.exports = router;
