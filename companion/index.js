import { me } from "companion";

import * as messaging from "messaging";

me.wakeinterval=300000;

const API_URL = "https://bsgw.ddns.net:24601/last-reading"; // Replace with your endpoint
const POLL_INTERVAL = 120 *  1000; // 2 mins
// Function to fetch data from an API
function fetchData() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      //  console.log(JSON.stringify(data));
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log(`Companion Read BS update: ${JSON.stringify(data)}`);
        messaging.peerSocket.send(data);
      } else {
        console.log("Device sleeping");
      }
    })
    .catch(err => console.error("Error fetching data:", err));
}

// Listen for incoming messages from the watch
messaging.peerSocket.onmessage = function(evt) {
  console.log("Received ping from device:", evt.data);
  fetchData();
};

// Fetch data when the companion starts
fetchData();
// Set an interval to poll data every 5 minutes
setInterval(fetchData, POLL_INTERVAL);
// Check if the app has permission to run in the background
if (!me.permissions.granted("run_background")) {
  console.warn("Permission to run in the background is not granted.");
}
