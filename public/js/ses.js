let audioIN = { audio: true };
//  audio is true, for recording 
// Start record
let start = document.getElementById('btnStart');
let sayac = document.getElementById('sayac');
// Access the permission for use 
// the microphone 
let playAudio;
let timebetween = 0;
let totalSeconds = 0;
let minutesLabel = document.getElementById("minutes");
let secondsLabel = document.getElementById("seconds");
let myVar;
mediaDevicesUtils(); //Bu ikincil işlem CHROME gerekçesiyle yazılmıştır

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(Math.floor(totalSeconds % 60));
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

let mediaRecorder, mediaStream;
window.onblur = (event) => {
    if (mediaStream != undefined) {
        tracks = mediaStream.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        mediaRecorder = null;
        mediaStream = null;
    }
}
window.onfocus = (event) => { mediaDevicesUtils(); }

function mediaDevicesUtils(argument) {


    navigator.mediaDevices.getUserMedia(audioIN)

        // 'then()' method returns a Promise 
        .then(function(mediaStreamObj) {

            start = document.getElementById('btnStart');
            var newStart = start.cloneNode(true);
            start.parentNode.replaceChild(newStart, start);
            start = document.getElementById('btnStart');
            mediaStream = mediaStreamObj;
            // Connect the media stream to the 
            // first audio element 
            let audio = document.getElementById('ses_container');
            //returns the recorded audio via 'audio' tag 

            // 'srcObject' is a property which  
            // takes the media object 
            // This is supported in the newer browsers 
            if ("srcObject" in audio) {
                audio.srcObject = mediaStreamObj;
            } else { // Old version 
                audio.src = window.URL
                    .createObjectURL(mediaStreamObj);
            }

            // Stop record 
            let stop = document.getElementById('btnStop');

            // 2nd audio tag for play the audio 
            //let playAudio = document.getElementById('adioPlay');
            playAudio = document.createElement("audio");

            // This is the main thing to recorde  
            // the audio 'MediaRecorder' API 
            mediaRecorder = new MediaRecorder(mediaStreamObj);
            // Pass the audio stream  

            // Start event 
            start.addEventListener('click', function(ev) {

            })
            start.addEventListener('touchstart', function(ev) {
                start.style.color = "red";
                sayac.style.display = "block";
                secondsLabel.innerHTML = "00";
                minutesLabel.innerHTML = "00";
                clearInterval(myVar);
                myVar = setInterval(setTime, 1000);
                mediaRecorder.start();

            })
            start.addEventListener('mousedown', function(ev) {
                start.style.color = "red";
                sayac.style.display = "block";
                secondsLabel.innerHTML = "00";
                minutesLabel.innerHTML = "00";
                clearInterval(myVar);
                myVar = setInterval(setTime, 1000);
                mediaRecorder.start();

            })

            // Stop event 
            start.addEventListener('mouseup', function(ev) {
                mediaRecorder.stop();
                start.style.color = "black";

                clearInterval(myVar);
                totalSeconds = 0;
                sayac.style.display = "none";

            });
            start.addEventListener('touchend', function(ev) {
                mediaRecorder.stop();
                start.style.color = "black";

                clearInterval(myVar);
                totalSeconds = 0;
                sayac.style.display = "none";

            });
            start.addEventListener('mouseleave', function(ev) {
                mediaRecorder.stop();
                start.style.color = "black";

                clearInterval(myVar);
                totalSeconds = 0;
                sayac.style.display = "none";
            });

            // Play event 
            playAudio.addEventListener('click', function(ev) {
                audio.play();
            });

            // If audio data available then push  
            // it to the chunk array 
            mediaRecorder.ondataavailable = function(ev) {
                dataArray.push(ev.data);
            }

            // Chunk array to store the audio data  
            let dataArray = [];

            // Convert the audio data in to blob  
            // after stopping the recording 
            mediaRecorder.onstop = function(ev) {
                // blob of type mp3 
                let audioData = new Blob(dataArray, { 'type': 'audio/mp3;' });
                // After fill up the chunk  
                // array make it empty 
                dataArray = [];

                // Creating audio url with reference  
                // of created blob named 'audioData' 
                let audioSrc = window.URL
                    .createObjectURL(audioData);
                blob2base64(audioData);
            }
        })

        // If any error occurs then handles the error  
        .catch(function(err) {
            console.log(err.name, err.message);
        });
}

function blob2base64(superBuffer) {

    var reader = new window.FileReader();
    reader.readAsDataURL(superBuffer);
    reader.onloadend = async function() {
        base64 = reader.result;
        base64 = base64.split(',')[1];
        playAudio.src = "data:audio/mp3;base64," + base64;
        playAudio.classList.add("img-fluid");
        playAudio.setAttribute("controls", "");
        await sleep(300);
        playAudio.setAttribute("preload", "metadata");
        playAudio.setAttribute("duration", playAudio.duration);
        var sure;
        sure = playAudio.duration;
        console.log("Süre1:" + sure);
        emitMess(sure);
    }
}

function emitMess(sure) {
    console.log("Süre2:" + sure);
    if (secondsLabel.innerText >= 1 || minutesLabel.innerText >= 1) {
        // Emit message to server
        socket.emit('chatMessage', playAudio.outerHTML);

    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}