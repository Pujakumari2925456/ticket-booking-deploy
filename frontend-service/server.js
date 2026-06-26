// const express = require('express');
// const path = require('path');
// const app = express();

// app.use(express.static(path.join(__dirname, 'public')));
// app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// app.listen(3000, () => console.log('Frontend running on port 3000'));

const express = require('express');
const path = require('path');
const fs = require('fs'); // Added file system module
const app = express();

// Serve static assets normally
app.use(express.static(path.join(__dirname, 'public')));

// Intercept the root index.html requests to inject the environment variable
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading index.html');
        }

        // Read the environment variable from Render (fallback to localhost if empty)
        const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

        // Inject a script tag into the head of your HTML string
        const injectedScript = `<script>window.VITE_API_BASE_URL = "${apiUrl}";</script>`;
        const modifiedData = data.replace('<head>', `<head>${injectedScript}`);

        res.send(modifiedData);
    });
});

app.listen(3000, () => console.log('Frontend running on port 3000'));