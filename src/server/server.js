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
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql');
require('dotenv').config();

const awsdb = mysql.createConnection({
    host:"eden-db.cfewcseg2kwe.ap-southeast-1.rds.amazonaws.com",
    port:"3306",
    user:"admin",
    password:"mypassword",
    database:"eden",
    connectTimeout: 60000, // Increase timeout to 60 seconds
    timeout: 600000,
});

awsdb.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        console.error('Error code:', err.code);
        console.error('Error fatal:', err.fatal);
        return;
    }
    console.log("Database connected");
});

// Additional check for handling database disconnection
awsdb.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
    }
});

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'youshallnotpass';
const GCLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GCLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GREDIRECT_URI = 'http://localhost:5000/google/callback';
const oAuth2Client = new OAuth2Client(GCLIENT_ID, GCLIENT_SECRET, GREDIRECT_URI);
const client = new OAuth2Client('748313570305-4oekils5fl4nhsk4dmkvohhv409kdt74.apps.googleusercontent.com');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase admin/serial-number-62043-firebase-adminsdk-ksceg-06f57859ca.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount) 
});

const db = admin.firestore();

const CALLBACK_URL = 'http://localhost:5000/callback';
const GOOGLE_REDIRECT_URI = 'http://localhost:5000/google/callback';

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors());

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const userId = uuidv4();  // Generate a unique UserID
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        await db.collection('users').doc(email).set({
            userId,
            email,
            password: hashedPassword,
            name,
            age,
            profilePicture: '',
            walletAddress: ''
        });
        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
  
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await db.collection('users').doc(email).get();
    if (userDoc.exists && await bcrypt.compare(password, userDoc.data().password)) {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
  
  const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };
  
  app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Access granted' });
  });

  app.get('/google/login', (req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });
    res.redirect(authorizeUrl);
});

app.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Fetch user profile
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const userData = response.data;
        const email = userData.email;
        const userDoc = await db.collection('users').doc(userData.email).get();

        if (!userDoc.exists) {
            const userId = uuidv4();  // Generate a unique UserID for new Google users
            await db.collection('users').doc(email).set({
                userId,
                email,
                name: userData.name,
                age: '',
                profilePicture: userData.picture,
                walletAddress: ''
            });
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        res.redirect(`http://localhost:3000/profile?token=${token}`);

        // Save user to your database or handle as needed
        //res.redirect(`http://localhost:3000/Login?username=${encodeURIComponent(userData.name)}`);
    } catch (error) {
        console.error('Error during Google login callback:', error);
        res.status(500).json({ error: 'Failed to log in user' });
    }
});

const oauth = Oauth({
    consumer: {
        key: process.env.CONSUMER_KEY,
        secret: process.env.CONSUMER_SECRET,
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
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=http://localhost:5000/discord/callback&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
});


app.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if(code) {
        const FormData = new url.URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
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

app.post('/update-profile', authenticateJWT, async (req, res) => {
    const { email } = req.user;
    const { name, age, profilePicture, walletAddress } = req.body;
    try {
        await usersCollection.doc(email).update({
            name,
            age,
            profilePicture,
            walletAddress
        });
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.post('/link-wallet', authenticateJWT, async (req, res) => {
    const { email } = req.user;
    const { walletAddress } = req.body;
    try {
        await usersCollection.doc(email).update({
            walletAddress
        });
        res.json({ message: 'Wallet linked successfully' });
    } catch (error) {
        console.error('Error linking wallet:', error);
        res.status(500).json({ error: 'Failed to link wallet' });
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

let whitePaperUrl = '';

// Ensure the upload directory exists
const uploadDir = 'uploads/white-papers';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// Configure Multer for white paper uploads
const whitePaperStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
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
        whitePaperUrl = fileUrl;

        // Save the URL to a file for persistence
        fs.writeFile('whitePaperUrl.txt', whitePaperUrl, (err) => {
            if (err) {
                console.error('Error saving URL to file:', err);
                res.status(500).json({ message: 'Error saving white paper URL' });
                return;
            }
            res.json({ message: 'White paper uploaded successfully!', url: fileUrl });
        });
    } else {
        res.status(400).json({ message: 'Error uploading white paper' });
    }
});

// Route to fetch the URL of the uploaded white paper
app.get('/white-paper-url', (req, res) => {
    if (fs.existsSync('whitePaperUrl.txt')) {
        whitePaperUrl = fs.readFileSync('whitePaperUrl.txt', 'utf-8');
    }
    res.status(200).json({ url: whitePaperUrl });
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