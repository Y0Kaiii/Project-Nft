const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const qs = require('qs'); // Import the qs library to stringify the data
const url = require('url');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up multer storage for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // save uploaded files to uploads directory
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // append timestamp to filename to avoid conflicts
    }
  });
  
  // Initialize multer upload
  const upload = multer({ storage: storage });
  

app.use(bodyParser.json());

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
    // Construct OAuth parameters
    const oauthParams = {
        oauth_callback: encodeURIComponent(twitterConfig.callbackUri),
        oauth_consumer_key: twitterConfig.consumerKey,
        oauth_nonce: generateNonce(32),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: '1.0'
    };

    // Sign the request
    oauthParams.oauth_signature = generateOAuthSignature('POST', 'https://api.twitter.com/oauth/request_token', oauthParams, twitterConfig.consumerSecret);

    // Send the request
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

        // Redirect user to Twitter for authorization
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

        // Prepare data for the POST request to exchange request token for access token
        const data = {
            oauth_verifier,
            oauth_token
        };

        // Stringify the data
        const postData = qs.stringify(data);

        // Make a POST request to Twitter's /oauth/access_token endpoint
        const response = await axios.post('https://api.twitter.com/oauth/access_token', postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Extract oauth_token and oauth_token_secret from the response
        const { oauth_token: accessToken, oauth_token_secret: accessTokenSecret } = qs.parse(response.data);

        // Now you have the access token and access token secret
        // You can store these tokens for future use
        const verifyCredentialsResponse = await axios.get('https://api.twitter.com/1.1/account/verify_credentials.json', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Extract user's email from the response
        const userName = verifyCredentialsResponse.data.screen_name;


        // Redirect the user to the desired page after successful authentication
        res.redirect(`http://localhost:3000/auth/callback/twitter/?name=${userName}`); // Replace '/dashboard' with your desired URL
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
                    'Authorization': Bearer `${access}`,
                },
            });

            console.log(output.data, userinfo.data);
        }
    }
});


app.get('/', (req, res) => {
    res.send('Hello, world!'); // Or render your app page here
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