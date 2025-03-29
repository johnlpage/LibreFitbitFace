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
        //const readings = await client.read();
        const readings = await client.fetchConnections();
        saveReadingToFile(readings);
    } catch (e) {
        console.error('Error fetching data:', e.message);
    }
}

async function start() {
    try {
        let password = await fs.readFile(".llpw", 'utf8');
        password = password.replace(/\r?\n|\r/g, '');
        client = new LibreLinkClient({ email, password });
        try {
            await client.login();
        }
        catch (e) {
            console.error('Login failed:', e.message);
            return;
        }
       // await getInfo(client);
        // Periodically call getInfo every minute
        setInterval(async () => {
            await getInfo(client);
        }, 5 * 60 * 1000);  // 60 seconds * 1000 milliseconds
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
       userId = 0; // Carol
    } 

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const readings = JSON.parse(data);

        res.json(readings.data[userId].glucoseItem)
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