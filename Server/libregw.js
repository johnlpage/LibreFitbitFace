import { LibreLinkClient } from 'libre-link-unofficial-api';
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';


import https from 'https';
var isHTTPS = true;
try {
    var privateKey = await fs.readFile('/home/ec2-user/privkey.pem', 'utf8');
    var certificate = await fs.readFile('/home/ec2-user/cert.pem', 'utf8');
} catch (e) {
    console.error('Error reading SSL certificate files:', e.message);
    isHTTPS = false;
}

const app = express();
const PORT = 24601;2

// Consider using environment variables for sensitive data
const email = "pagelibremonitor@gmail.com"

let client;

async function saveReadingToFile(reading) {
    const filePath = path.join(process.cwd(), 'readings.json');
    await fs.writeFile(filePath, JSON.stringify(reading, null, 2), 'utf8');
}

async function getInfo(client) {
    try {
        const readings = await client.fetchConnections();
        for( let u of readings.data) {
            const {firstName , lastName, glucoseItem} = u;
            console.log(`User: ${firstName} ${lastName}, Glucose: ${glucoseItem.Value} ${glucoseItem.Timestamp}`);
        }
        saveReadingToFile(readings);
        console.log('Data fetched and saved successfully:');
    } catch (e) {
        console.error('Error fetching data:', e.message);
    }
}

async function start() {
    try {
        let password = await fs.readFile(".llpw", 'utf8');
        password = password.replace(/\r?\n|\r/g, '');
        client = new LibreLinkClient({ email, password,cache:false });
        try {
            await client.login();
        }
        catch (e) {
            console.error('Login failed:', e.message);
            return;
        }
       // await getInfo(client);
        // Periodically call getInfo every minute
         await getInfo(client);
        setInterval(async () => {
            await getInfo(client);
        }, 2 * 60 * 1000);  // 60 seconds * 1000 milliseconds
    } catch (e) {
        console.error('Login failed:', e.message);
    }
}

start();
// Endpoint to get the last reading
app.get('/last-reading/:userId?', async (req, res) => {

    const filePath = path.join(process.cwd(), 'readings.json');
    let userId = req.params.userId;
  
    if (!userId) {
        userId = "Carol"; // Carol
       console.log("Request from Carol , using default userId:" + req.headers['user-agent']);
    }  else {

        console.log(`Request from John for userId ${userId} ${req.headers['user-agent']}`);
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const readings = JSON.parse(data);

        const user = readings.data.find(user => user.firstName === userId)
        //console.log(user);
        user.glucoseItem.name = userId
        res.json(user.glucoseItem)
    } catch (error) {
        console.error(`Failed to read file: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

if (isHTTPS) {
    var credentials = { key: privateKey, cert: certificate };
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`)
    })
}