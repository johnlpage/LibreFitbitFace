import { me } from "companion";
// Companion app saves data  



import * as messaging from "messaging";

me.wakeInterval = 300000; // 1 minute
const API_URL = "https://bsgw.ddns.net:24601/last-reading"; // Replace with your endpoint
const POLL_INTERVAL = 120 * 1000; // 2 mins

//console.log("Companion app started");

// The socket opens automatically when conditions are met  
messaging.peerSocket.addEventListener("open", () => {
//  console.log("✅ Connection opened!");
  fetchData();
});

// Function to fetch data from an API
function fetchData() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
    //  console.log(`Companion Read BS update from internet: ${JSON.stringify(data)}`);
      SendBSToWatch(data)
    })
    .catch(err => console.error("Error fetching data:", err));
}

function SendBSToWatch(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {

    if (data) {
    //  console.log(`Sending data to watch`);
      messaging.peerSocket.send(data);
    }
  } else {
   // console.log("Device sleeping");
  }
}

// Listen for incoming messages from the watch
messaging.peerSocket.onmessage = function(evt) {
  console.log("Received ping from watch:", evt.data);
  fetchData(); // Fetch data when a ping is received
};


if (me.launchReasons.wokenUp) { 
   // The companion started due to a periodic timer
  // console.log("Started due to wake interval!");
}

  me.addEventListener("wakeinterval", () => {
   // console.log("Companion onwakeinterval:", new Date().toISOString());
    fetchData();
  });

  // Check if the app has permission to run in the background
  if (!me.permissions.granted("run_background")) {
    console.warn("Permission to run in the background is not granted.");
  }
