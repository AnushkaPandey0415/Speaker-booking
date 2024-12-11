import express from 'express';
import {
    signupController,
    loginController,
    createSpeakerProfile,
    getSpeakerProfiles,
    bookSpeaker,
    blockSlot,
    getBlockedSlots,
    getBookings,
    getUserProfile,
} from './controllers';
import { authenticateToken } from './middleware';

const router = express.Router();

// Authentication Routes
router.post('/signup', signupController);
router.post('/login', loginController);

//User Profile
router.get('/user-profile', authenticateToken, getUserProfile);

// Speaker Profile Routes
router.post('/save-speaker-profile', authenticateToken, createSpeakerProfile);
router.get('/speakers', authenticateToken, getSpeakerProfiles);

// Booking Routes
router.post('/book', authenticateToken, bookSpeaker);
router.get('/bookings', authenticateToken, getBookings);

// Blocked Slots Routes
router.post('/speakers/:speakerId/block', authenticateToken, blockSlot);
router.get('/speakers/:speakerId/blocked-slots', authenticateToken, getBlockedSlots);

export default router;
