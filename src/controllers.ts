import { Request, Response } from 'express';
import { signup, login } from './auth';
import { queryDB } from './database';
import { ResultSetHeader } from 'mysql2';
import { verifyUserCredentials, generateToken } from './auth';
// User Signup
export const signupController = async (req: Request, res: Response): Promise<void> => {
    await signup(req, res);
};

//login 

export const loginController = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    // Validate user credentials
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      console.log('Invalid credentials for:', email);
      return res.status(401).json({ message: 'Invalid credentials' }); // Stop further execution
    }

    // Generate token
    const token = generateToken(user);
    console.log('Login successful for:', email);

    // Return the token to the client
    return res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Get Speaker Profiles
export const getSpeakerProfiles = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { results } = await queryDB('SELECT * FROM SpeakerProfiles');
        res.status(200).json(results); // Return only the 'results' array
    } catch (error) {
        console.error('Error fetching speaker profiles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Get User Profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // Assuming `req.user.id` contains the user's ID after token authentication
        const userId = req.user.id;
 
        const query = 'SELECT first_name, last_name, email, user_type FROM Users WHERE id = ?';
        const { results } = await queryDB(query, [userId]); // Destructure results from the returned object
 
        // Check if results is empty
        if (!results || results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
 
        // Send the user profile data as the response
        res.status(200).json({ user: results[0] });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Book Speaker
export const bookSpeaker = async (req: Request, res: Response): Promise<void> => {
    const { speakerId, date, time_slot } = req.body; 
    const userId = req.user.id;
 
    // Convert speakerId to an integer
    const parsedSpeakerId = parseInt(speakerId, 10);
 
    try {
        console.log('Booking request received:', { speakerId: parsedSpeakerId, date, time_slot, userId });
 
        // Check if the speaker exists
        const speakerResult = await queryDB('SELECT * FROM SpeakerProfiles WHERE id = ?', [parsedSpeakerId]);
        console.log('Speaker Query Result:', speakerResult);
 
        const speaker = speakerResult.results[0];
        if (!speaker) {
            res.status(404).json({ success: false, message: `Speaker not found with ID: ${parsedSpeakerId}` });
            return;
        }
 
        // Proceed with booking
        const result = await queryDB(
            'INSERT INTO Bookings (user_id, speaker_id, date, time_slot) VALUES (?, ?, ?, ?)',
            [userId, parsedSpeakerId, date, time_slot]
        );
        console.log('Booking Insert Result:', result);
 
        const resultSetHeader = result[0] as ResultSetHeader;
        if (resultSetHeader && resultSetHeader.affectedRows > 0) {
            res.status(201).json({ success: true, message: 'Speaker booked successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to book speaker' });
        }
    } catch (error) {
        console.error('Error booking speaker:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// Create Speaker Profile
export const createSpeakerProfile = async (req: Request, res: Response): Promise<void> => {
    const { expertise, price_per_session } = req.body;
    const userId = req.user.id; // Get the user ID from JWT
   
    try {
        const result = await queryDB(
            `INSERT INTO SpeakerProfiles (user_id, expertise, price_per_session) VALUES (?, ?, ?)`,
            [userId, expertise, price_per_session]
        );

        // Ensure that affectedRows is available
        if (result.affectedRows && result.affectedRows > 0) {
            res.status(201).json({ success: true, message: 'Speaker profile created successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to create speaker profile' });
        }
    } catch (error) {
        console.error('Error creating speaker profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Block Slot
export const blockSlot = async (req: Request, res: Response): Promise<void> => {
    const { speakerId } = req.params;
    const { date, time_slot } = req.body;

    try {
        const result = await queryDB(
            `INSERT INTO BlockedSlots (speaker_id, date, time_slot) VALUES (?, ?, ?)`,
            [speakerId, date, time_slot]
        );

        // Assuming the result is an array with the first element being a ResultSetHeader
        const resultSetHeader = result[0] as ResultSetHeader;

        if (resultSetHeader.affectedRows > 0) {
            res.status(201).json({ success: true, message: 'Slot blocked successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to block slot' });
        }
    } catch (error) {
        console.error('Error blocking slot:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Blocked Slots
export const getBlockedSlots = async (req: Request, res: Response): Promise<void> => {
    const { speakerId } = req.params;

    try {
        const blockedSlots = await queryDB(
            `SELECT * FROM BlockedSlots WHERE speaker_id = ?`,
            [speakerId]
        );
        res.status(200).json(blockedSlots);
    } catch (error) {
        console.error('Error fetching blocked slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Bookings
export const getBookings = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id; // Get the user ID from JWT

    try {
        const bookings = await queryDB(`SELECT * FROM Bookings WHERE user_id = ?`, [userId]);
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
