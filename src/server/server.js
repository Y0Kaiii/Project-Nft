const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const url = require('url'); // Import the url module

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// OAuth configuration for Twitter
const twitterConfig = {
    authUrl: 'https://api.twitter.com/oauth/request_token',
    tokenUrl: 'https://api.twitter.com/oauth/access_token',
    userProfileUrl: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    consumerKey: 'qaEbeQqLNDguW7bLiSlLRL9QD',
    consumerSecret: 'meHBOHkRKt2AxhHmJBa6NF9n3uHcWqZbf6Jm252ebcLDsjVey1',
    accessToken: '4733512986-M7w2Sg2e3QC4KK4clSj6R9PxZnmcjAMDJo5qbb4',
    accessTokenSecret: 'urIdB7VehRezN2RWkk8xvHaQPcUyu7SsVh0v3RICcGaCJ',
    callbackUri: `http://localhost:3000/auth/callback/twitter`,
    scope: ''
};

// Function to generate a nonce
function generateNonce(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return nonce;
}

function generateOAuthSignature(httpMethod, baseURL, parameters, consumerSecret, tokenSecret) {
    const parameterString = Object.keys(parameters)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
        .sort()
        .join('&');

    const signatureBaseString = `${httpMethod.toUpperCase()}&${encodeURIComponent(baseURL)}&${encodeURIComponent(parameterString)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret || '')}`;

    const hmac = crypto.createHmac('sha1', signingKey);
    hmac.update(signatureBaseString);
    const signature = hmac.digest('base64');

    return signature;
}

// Route to initiate the OAuth flow and obtain request token
app.get('/auth/twitter', (req, res) => {
    const oauthParams = {
        oauth_callback: encodeURIComponent(twitterConfig.callbackUri),
        oauth_consumer_key: twitterConfig.consumerKey,
        oauth_nonce: generateNonce(32),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: '1.0'
    };

    oauthParams.oauth_signature = generateOAuthSignature('POST', 'https://api.twitter.com/oauth/request_token', oauthParams, twitterConfig.consumerSecret);

    axios.post('https://api.twitter.com/oauth/request_token', null, {
        params: oauthParams,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        const responseData = response.data;
        const parsedData = responseData.split('&').reduce((acc, current) => {
            const [key, value] = current.split('=');
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});

        if (parsedData.oauth_callback_confirmed !== 'true') {
            throw new Error('OAuth callback not confirmed');
        }

        const redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${parsedData.oauth_token}`;
        res.redirect(redirectUrl);
    })
    .catch(error => {
        console.error('Error obtaining request token:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.get('/auth/callback/twitter', async (req, res) => {
    try {
        const { oauth_token, oauth_verifier } = req.query;

        const data = {
            oauth_verifier,
            oauth_token
        };

        const postData = qs.stringify(data);

        const response = await axios.post('https://api.twitter.com/oauth/access_token', postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret } = qs.parse(response.data);

        const verifyCredentialsResponse = await axios.get('https://api.twitter.com/1.1/account/verify_credentials.json', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userName = verifyCredentialsResponse.data.screen_name;

        res.redirect(`http://localhost:3000/auth/callback/twitter/?name=${userName}`);
    } catch (error) {
        console.error('Error handling Twitter OAuth callback:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/discord/redirect', async (req, res) => {
    const { code } = req.query;

    if(code) {
        const FormData = new url.URLSearchParams({
            client_id: '1234504153712296018',
            client_secret: 'TPz8DbmGSWVlUlGHXUJm-wDHc3nKCMFr',
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: 'http://localhost:5000/api/auth/discord/redirect',
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
const upload = multer({
    dest: 'uploads/',
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
});

// Route to handle video uploads (replace with authorization checks)
app.post('/upload-video', upload.single('video'), (req, res) => {
    if (req.file && projectData.videos.length < 3) {
        projectData.videos.push({ name: req.file.originalname, path: req.file.path });
        res.json({ message: 'Video uploaded successfully!' });
    } else if (req.file && projectData.videos.length >= 3) {
        res.status(400).json({ message: 'Maximum 3 videos allowed!' });
    } else {
        res.status(400).json({ message: 'Error uploading video' });
    }
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

// Dummy database to store user data
const users = {};

// Endpoint for creating a new user
app.post('/users', upload.single('profilePicture'), (req, res) => {
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