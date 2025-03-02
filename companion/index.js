import { me } from "companion";
import { peerSocket } from "messaging";


const API_URL = "https://bsgw.ddns.net:24601/last-reading"; // Replace with your endpoint
const POLL_INTERVAL = 30 *  1000; // 5 seconds
// Function to fetch data from an API
function fetchData() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      //  console.log(JSON.stringify(data));
      if (peerSocket.readyState === peerSocket.OPEN) {
        console.log(`BS Upadte: ${data.Value}`);
        peerSocket.send({ bs: data.Value});
      }
    })
    .catch(err => console.error("Error fetching data:", err));
}
// Fetch data when the companion starts
fetchData();
// Set an interval to poll data every 5 minutes
setInterval(fetchData, POLL_INTERVAL);
// Check if the app has permission to run in the background
if (!me.permissions.granted("run_background")) {
  console.warn("Permission to run in the background is not granted.");
}
