import { LibreLinkClient } from 'libre-link-unofficial-api';
import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';


import https from 'https';

var privateKey =  await fs.readFile('/home/ec2-user/privkey.pem', 'utf8');
var certificate =  await fs.readFile('/home/ec2-user/cert.pem', 'utf8');


const app = express();
const PORT = 24601;
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);

// Consider using environment variables for sensitive data
const email = "johnlpage@gmail.com"

let client;

async function saveReadingToFile(reading) {
    const filePath = path.join(process.cwd(), 'readings.json');
    await fs.writeFile(filePath, JSON.stringify(reading, null, 2), 'utf8');
}

async function getInfo(client) {
    try {
        const reading = await client.read();
     //   console.log(reading);
        saveReadingToFile(reading);
    } catch (e) {
        console.error('Error fetching data:', e.message);
    }
}

async function start() {
    try {
        let password = await fs.readFile(".llpw", 'utf8');
        password = password.replace(/\r?\n|\r/g, '');
        client = new LibreLinkClient({ email, password });
        await client.login();
        await getInfo(client);
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
app.get('/last-reading', async (req, res) => {

    const filePath = path.join(process.cwd(), 'readings.json');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const obj  = JSON.parse(data);
        res.json(obj._raw);
    } catch (error) {
        console.error(`Failed to read file: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

httpsServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
