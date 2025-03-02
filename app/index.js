import document from "document";
import clock from "clock";
import { today } from "user-activity";
import { battery } from "power";
import { preferences } from "user-settings";
import * as messaging from "messaging";
import { me as appbit } from "appbit";

let lastBS = `7.0`

function zeroPad(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}


// Listen for messages from the companion


messaging.peerSocket.onmessage = evt => {

    if (evt.data) {
        lastBS = evt.data.bs;
        let BSLabel = document.getElementById("sugar");
        BSLabel.text = lastBS;
    }
};



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


    hours = zeroPad(hours);
    let mins = zeroPad(now.getMinutes());

    let timeLabel = document.getElementById("time");

    timeLabel.text = `${hours}:${mins}`;
    let timetext = `${hours}${mins}`;
    for(let c=0;c<4;c++) {
        document.getElementById(`digit_${c+1}`).href = `images/${timetext[c]}.png`
    }

    let BSLabel = document.getElementById("sugar");
    let dateLabel = document.getElementById("date");
    timeLabel.text = `${hours}:${mins}`;
    dateLabel.text = `${day}/${month}`
    BSLabel.text = lastBS;

    if (appbit.permissions.granted("access_activity")) {
        let steps = today.adjusted.steps
        document.getElementById("steps").text = `${steps}`;
    } else {
        console.log("Permissions idea")
    }
}