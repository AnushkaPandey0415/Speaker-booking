import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryDB } from './database';  // Assuming queryDB function is defined in database.ts
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Register Function (Signup)
export const signup = async (req: express.Request, res: express.Response): Promise<void> => {
  const { first_name, last_name, email, password, user_type } = req.body;

  try {
    // Check if the user already exists
    const result = await queryDB('SELECT * FROM users WHERE email = ?', [email]);
    const existingUser = result.results[0];  // Adjusted to access results

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertResult = await queryDB(
      'INSERT INTO users (first_name, last_name, email, password, user_type) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, user_type]
    );

    // Check if any rows were affected (successful insert)
    if (insertResult.affectedRows && insertResult.affectedRows > 0) {
      res.status(201).json({ success: true, message: 'User created successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login Function (Authentication)
export const login = async (req: express.Request, res: express.Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await queryDB('SELECT * FROM users WHERE email = ?', [email]);
    const user = result[0]; // Correct access to the first row of the result

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.is_verified) {
      res.status(401).json({ message: 'User not verified. Please verify your account.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Function to verify user credentials (if needed for other parts of the app)
export const verifyUserCredentials = async (email: string, password: string) => {
  try {
      const result = await queryDB('SELECT * FROM users WHERE email = ?', [email]);
      const user = result.results[0];  // Access the first row of the result

      if (!user) {
          return null; // No user found
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return null; // Invalid password
      }

      return user; // Return the user object if credentials match
  } catch (error) {
      console.error('Error verifying credentials:', error);
      throw new Error('Database error');
  }
};
// Save Speaker Profile (Requires Authentication)
export const saveSpeakerProfile = async (req: express.Request, res: express.Response): Promise<void> => {
  const { expertise, price_per_session } = req.body;
  const userId = req.user.id;

  try {
    const insertResult = await queryDB(
      'INSERT INTO speaker_profiles (user_id, expertise, price_per_session) VALUES (?, ?, ?)',
      [userId, expertise, price_per_session]
    );

    if ('insertId' in insertResult) {
      res.status(201).json({ success: true, message: 'Profile saved successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save profile' });
    }
  } catch (err) {
    console.error('Error saving speaker profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Function to generate JWT token
export const generateToken = (user: any) => {
  const payload = {
      id: user.id,
      email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};