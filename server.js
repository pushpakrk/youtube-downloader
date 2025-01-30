// Import required libraries
import express from 'express';
import ytdl from 'ytdl-core';
import path from 'path';

// Initialize Express app
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Middleware to parse JSON
app.use(express.json());

// Route to handle video download requests
app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ message: 'Invalid YouTube URL.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[\/\\:*?"<>|]/g, '_'); // Sanitize filename
        const fileName = `${videoTitle}.mp4`;

        // Generate a stream for the video
        const videoStream = ytdl(url, { quality: 'highest' });

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Pipe the video stream to the response
        videoStream.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ message: 'An error occurred while downloading the video.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

