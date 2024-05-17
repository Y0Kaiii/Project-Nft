const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const url = require('url'); // Import the url module
const Oauth = require('oauth-1.0a');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const CALLBACK_URL = 'http://localhost:5000/callback';

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());


const oauth = Oauth({
    consumer: {
        key: 'qaEbeQqLNDguW7bLiSlLRL9QD',
        secret: 'meHBOHkRKt2AxhHmJBa6NF9n3uHcWqZbf6Jm252ebcLDsjVey1',
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
});

// Route to initiate the OAuth flow and obtain request token
app.get('/request-token', async (req, res) => {
    try {
        const requestTokenURL = `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent(CALLBACK_URL)}&x_auth_access_type=write`;
        const authHeader = oauth.toHeader(oauth.authorize({
            url: requestTokenURL,
            method: 'POST',
        }));

        const response = await fetch(requestTokenURL, {
            method: 'POST',
            headers: {
                Authorization: authHeader['Authorization'],
            },
        });

        const body = await response.text();
        const oAuthRequestToken = Object.fromEntries(new URLSearchParams(body));

        
        res.json(oAuthRequestToken);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get request token' });
    }
});

app.get('/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;

    try {
        const url = `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`;
        const authHeader = oauth.toHeader(oauth.authorize({
            url,
            method: 'POST',
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: authHeader['Authorization'],
            },
        });

        const body = await response.text();
        const oAuthAccessToken = Object.fromEntries(new URLSearchParams(body));


        // Fetch username
        const username = await fetchUsername(oAuthAccessToken);

        // Redirect to your React app with the username
        res.redirect(`http://localhost:3000/Login?username=${encodeURIComponent(username)}`); // Adjust the redirect URL as needed for your setup
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get access token' });
    }
});

async function fetchUsername({ oauth_token, oauth_token_secret }) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    };

    const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    const headers = oauth.toHeader(oauth.authorize({
        url,
        method: 'GET'
    }, token));

    try {
        const request = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: headers['Authorization'],
                'user-agent': 'V2UserLookupJS',
                'content-type': 'application/json',
                'accept': 'application/json'
            }
        });

        const body = await request.json();
        return body.screen_name; // Or use another property if you want
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

app.get('/discord/login', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=1234504153712296018&redirect_uri=http://localhost:5000/discord/callback&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});


app.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if(code) {
        const FormData = new url.URLSearchParams({
            client_id: '1234504153712296018',
            client_secret: 'TPz8DbmGSWVlUlGHXUJm-wDHc3nKCMFr',
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: 'http://localhost:5000/discord/callback',
        });

        const output = await axios.post('https://discord.com/api/v10/oauth2/token',
        FormData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if(output.data) {
            const access = output.data.access_token

            const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${access}`, // Fix syntax error here
                },
            });

            console.log(output.data, userinfo.data);
            const { username } = userinfo.data;
            res.redirect(`http://localhost:3000/Login?username=${encodeURIComponent(username)}`);
        }
    }
});

// Placeholder project data (replace with database or API integration)
const projectData = {
    name: "",
    description: "",
    platform: "",
    socialLink: "",
    websiteLink: "",
    marketplaceLink: "",
    releaseDate: "",
    picture: "", // Path to project picture
    videos: [], // Array to store video information (name, path)
};

// Configure Multer for video uploads
const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/videos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// Configure Multer for video uploads
const vidupload = multer({
    storage: videoStorage,
    limits: { fileSize: 30000000 },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.mp4', '.mov', '.avi'];
        const extname = path.extname(file.originalname);
        if (allowedExtensions.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Only video files allowed'));
        }
    }
}).single('video');

// Route to handle video uploads (replace with authorization checks)
app.post('/upload-video', vidupload, (req, res) => {
    if (req.file && projectData.videos.length < 3) {
        projectData.videos.push({ name: req.file.originalname, path: req.file.path });
        res.json({ message: 'Video uploaded successfully!' });
    } else if (req.file && projectData.videos.length >= 3) {
        res.status(400).json({ message: 'Maximum 3 videos allowed!' });
    } else {
        res.status(400).json({ message: 'Error uploading video' });
    }
});

// Configure Multer for white paper uploads
const whitePaperStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/white-papers');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadWhitePaper = multer({
    storage: whitePaperStorage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const extname = path.extname(file.originalname);
        if (allowedExtensions.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files allowed'));
        }
    }
}).single('whitePaper');

// Route to handle white paper uploads
app.post('/upload-white-paper', uploadWhitePaper, (req, res) => {
    if (req.file) {
        const filePath = req.file.path;
        const fileUrl = `http://localhost:${PORT}/${filePath}`;
        WhitePaperUrl = fileUrl;
        res.json({ message: 'White paper uploaded successfully!', url: fileUrl });
    } else {
        res.status(400).json({ message: 'Error uploading white paper' });
    }
});

// Route to fetch the URL of the uploaded white paper
app.get('/white-paper-url', (req, res) => {
    // Retrieve the URL from wherever it's stored (e.g., database or file system
    res.status(200).json({ url: WhitePaperUrl });
});

// Route to handle project data updates (replace with validation)
app.post('/update-project', bodyParser.urlencoded(), (req, res) => {
    projectData.name = req.body.name;
    projectData.description = req.body.description;
    projectData.platform = req.body.platform;
    projectData.socialLink = req.body.socialLink;
    projectData.websiteLink = req.body.websiteLink;
    projectData.marketplaceLink = req.body.marketplaceLink;
    projectData.releaseDate = req.body.releaseDate;
    projectData.picture = req.body.picture;
    res.json({ message: 'Project details updated!' });
});

// Route to render project details page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Sample data for searching (replace with your data source)
const projects = [
    { name: "Project Alpha", description: "This is project alpha" },
    { name: "Project Beta", description: "This is project beta" },
    { name: "Project Gamma", description: "This is project gamma" },
];

app.get('/search', (req, res) => {
    const searchTerm = req.query.term;

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    res.json(filteredProjects);
});

// Configure Multer for file uploads
const Picstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pics'); // Specify the directory to store uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique file name
    }
});

const Picupload = multer({
    storage: Picstorage,
    limits: { fileSize: 1024 * 1024 * 10 } // Limit file size to 10MB
});
// Dummy database to store user data
const users = {};

// Endpoint for creating a new user
app.post('/users', Picupload.single('profilePicture'), (req, res) => {
  const { name, age, accountId, password } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  // Check if required fields are provided
  if (!(name && age && accountId && password)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if accountId already exists
  if (users.hasOwnProperty(accountId)) {
    return res.status(400).json({ error: 'Account ID already exists' });
  }

  // Save user data
  users[accountId] = { name, age, profilePicture, password };

  return res.status(201).json({ message: 'User created successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});