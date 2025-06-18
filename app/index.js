import document from "document";
import clock from "clock";
import { today } from "user-activity";
import * as messaging from "messaging";
import { me as appbit } from "appbit";

let latestData;

function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}



// Function to parse the date string
function parseCustomDate(dateStr) {
  const [datePart, timePart, period] = dateStr.split(' ');
  // Split date part into month, day, year
  const [month, day, year] = datePart.split('/').map(Number);
  // Split time part into hours, minutes, seconds
  let [hours, minutes, seconds] = timePart.split(':').map(Number);
  // Adjust hours based on AM/PM
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Create and return a new Date object
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

// Listen for messages from the companion
messaging.peerSocket.onmessage = evt => {
  if (evt.data) {
    latestData = evt.data
   // console.log(`Received data`);
    showBS(null); //Update on receipt
  }
};


// Update the clock every minute
clock.granularity = "minutes";

let clickCount = 0;
let myElement = document.getElementById("bg");
myElement.addEventListener("click", () => {
  clickCount++;
  if (clickCount > 4) {
    appbit.exit();
  }
});

function requestUpdate() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ ping: true });
  } else {
    console.log("The companion is not available.");
  }
}

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  clickCount=0;
  let now = evt.date;
  let hours = now.getHours();
  const day = now.getDate();
  const month = now.getMonth() + 1; // Months are zero-based, so add 1
  const mstr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  hours = zeroPad(hours);
  let mins = zeroPad(now.getMinutes());

  let timetext = `${hours}${mins}`;
  for (let c = 0; c < 4; c++) {
    document.getElementById(`digit_${c + 1}`).href = `images/${timetext[c]}.png`
  }

  let dateLabel = document.getElementById("date");
  dateLabel.text = `${mstr[month - 1]} ${day}`

  if (appbit.permissions.granted("access_activity")) {
    let steps = today.adjusted.steps
    document.getElementById("steps").text = `${steps}`;
  }
  showBS(now);
}

function showBS(now) {
  let BSLabel = document.getElementById("sugar");
  const arrows = ["?", "↘", "→", "↓", "↗", "↑", "?"];

  if (!latestData) {
    BSLabel.text = "No data";
    return;
  }

 

  BSLabel.text = `${latestData.Value.toFixed(1)} ${arrows[latestData.TrendArrow - 1]}`

  if (now) {
    let bsDate = parseCustomDate(latestData.Timestamp.toString());
    let diff = Math.floor((now.getTime() - bsDate.getTime()) / 1000);
    console.log(`No update for ${diff}s`);
    if(diff> 600) {
      appbit.exit();
    }
    if (diff > 180) {
      requestUpdate();
    }
  }
}