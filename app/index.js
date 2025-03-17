import document from "document";
import clock from "clock";
import { today } from "user-activity";
import * as messaging from "messaging";
import { me as appbit } from "appbit";
import { vibration } from "haptics";

let lastBS = '';
let lastBSTime = new Date();
let prevBS = 0;

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
    const newBS = evt.data.Value;

    let d = parseCustomDate(evt.data.Timestamp);
    lastBSTime = d;
    //console.log(`Reading update ${d.toISOString()}`);
    let BSLabel = document.getElementById("sugar");
    BSLabel.text = lastBS;
    if (lastBS >= 4 && newBS < 4) {
      vibration.start("alert");
    }
    lastBS = newBS
    let now = evt.date;
    showBS(now);
  }
};


let myElement = document.getElementById("bg");
myElement.addEventListener("click", () => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ping:true});
   // console.log("Ping!")
  } else {
   // console.log("The connection is not open.");
  }

});


// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element

//const BSLabel = document.getElementById("sugar");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {


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
  dateLabel.text = `${day} ${mstr[month-1]}`

  showBS(now);

  if (appbit.permissions.granted("access_activity")) {
    let steps = today.adjusted.steps
    document.getElementById("steps").text = `${steps}`;
  } else {
   // console.log("Permissions idea")
  }


}

function showBS(now) {
  let BSLabel = document.getElementById("sugar");
  let readTime = 0;
  if(now){
   readTime = Math.floor((now.getTime() - lastBSTime.getTime()) / 60000);
  }
  BSLabel.text = `${(readTime < 15) ? `${lastBS}` : `-`}`;
  if (readTime > 5) {
   // appbit.exit()
  }

}