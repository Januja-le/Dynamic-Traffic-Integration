const axios = require('axios');
const jwt = require('jsonwebtoken');

// Generate Zoom JWT token
const generateZoomToken = () => {
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
  };
  return jwt.sign(payload, process.env.ZOOM_API_SECRET);
};

// Create Zoom meeting
const createZoomMeeting = async (topic, startTime, duration) => {
  try {
    const token = generateZoomToken();
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          audio: 'voip',
          auto_recording: 'none',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    throw new Error('Failed to create Zoom meeting');
  }
};

module.exports = { generateZoomToken, createZoomMeeting };
