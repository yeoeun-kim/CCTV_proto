let webcam;
let detector;

let myVidoeRec;

let videoFrame;

let state = 0;
// 0: main page  1: recording page  2: paused page  3: saved page

//let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_recordingTime = [];
let stateIndicator = [];

let recordingTime = '00:00:00'; //Text type variable
let recordingStartTime = 0; //Number type varialbe
let pausedStartTime = 0; //Number type variable
let pausedTime = 0; //Number type variable
let totalPausedTime = 0; //Number type variable

let now;
let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", 
                "Thursday", "Friday", "Sarurday"];

let peopleNumber = 0;

let detectedObjects = [];

let myWriter;
let writerMsg='';


function preload() {
  detector = ml5.objectDetector('cocossd');

  btn_record[0] = loadImage('img/record_start.png');
  btn_record[1] = loadImage('img/pause_recording.png');
  btn_record[2] = loadImage('img/record_paused.png');
  btn_record[3] = loadImage('img/record_saved.png');
  
  btn_stop[0] = loadImage('img/stop_save.png');
  btn_stop[1] = loadImage('img/stop_save.png');
  btn_stop[2] = loadImage('img/stop_save.png');
  btn_stop[3] = loadImage('img/stop_deactivated.png');
  
  icon_recordingTime[0] = loadImage('img/timeStopped.png');
  icon_recordingTime[1] = loadImage('img/timeRecording.png');
  icon_recordingTime[2] = loadImage('img/timePaused.png');
  icon_recordingTime[3] = loadImage('img/timeStopped.png');
  
  timelabel = loadImage('img/timeLabel.png');
  
  stateIndicator[0] = ''
  stateIndicator[1] = 'NOW RECORDING'
  stateIndicator[2] = 'PAUSED'
  stateIndicator[3] = 'SAVED!'
  
  now = new Date(); 
  yoil= dayNames[now.getDay()]

}

function setup() {
  createCanvas(1280, 832);
  webcam = createCapture(VIDEO);
  webcam.size(971,728);
  webcam.hide();
  
  myVideoRec = new P5MovRec();
  
  detector.detect(webcam, gotDetections);
}

function keyPressed() {
  if (keyCode === ENTER) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function draw() {
  background(38,38,38);
  
  calculateRecordingTime();
  
  drawVideoPreview(52,52,971,728);
  
  doCOCOSSD(state);
  
  drawButtons(state);
  drawStatus(state);
  drawTIME(state);
  drawStateIndicator(state);
  writeLog(state);
  
  peopleNumber = 0;
}

function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
}

function drawStateIndicator(currentState){
  fill(255,255,255);
  textAlign(CENTER);
  text(stateIndicator[currentState], 1148, 671);
}

function drawButtons(currentState){
  image(btn_record[currentState], 1065, 711, 69, 69);
  image(btn_stop[currentState], 1164, 711, 69, 69);
}

function drawTIME(currentState){  
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'/'+nf(month(),2,0)+'/'+nf(day(),2,0)+'('+ yoil.substring(0, 3)+')';
  
  fill(176, 255, 80);
  stroke(0,153);
  strokeWeight(1)
  textAlign(RIGHT);
  textFont('Inter');
  textStyle(BOLD);
  textSize(24);
  text(currentTime, 1000, 732); 
  textSize(16);
  text(currentDate, 1000, 758);
  
  image(timelabel, 71, 69, 148, 48);
  image(icon_recordingTime[currentState], 91, 81.5, 23, 23);
  textAlign(LEFT);
  textStyle(NORMAL);
  fill(255);
  text(recordingTime, 124, 98.5);
}



function drawStatus(currentState){
  textFont('Inter');
  textSize(14);
  fill(255);
  noStroke();

  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  
  if(currentState == 0){
    fill(255);
    textAlign(LEFT);
    textStyle(BOLD);
    text("Current time", 1053, 69);
    fill(255, 153);
    text("Recording time", 1053, 163);
    text("Passengers", 1053, 257);
    textStyle(NORMAL);
    fill(255);
    text(currentTime, 1053, 100);
    fill(255, 153);
    text(recordingTime, 1053, 194);
    text(peopleNumber, 1053, 288);
  }
  else if(currentState == 1){
    fill(255);
    textAlign(LEFT);
    textStyle(BOLD);
    text("Current time", 1053, 69);
    text("Recording time", 1053, 163);
    text("Passengers", 1053, 257);
    textStyle(NORMAL);
    text(currentTime, 1053, 100);
    text(recordingTime, 1053, 194);
    text(peopleNumber, 1053, 288);
  }
  else if(currentState == 2){
    fill(255);
    textAlign(LEFT);
    textStyle(BOLD);
    text("Current time", 1053, 69);
    fill(255, 153);
    text("Recording time", 1053, 163);
    text("Passengers", 1053, 257);
    textStyle(NORMAL);
    fill(255);
    text(currentTime, 1053, 100);
    fill(255, 153);
    text(recordingTime, 1053, 194);
    text(peopleNumber, 1053, 288);
  }
  else if(currentState == 3){
    fill(255, 153);
    textAlign(LEFT);
    textStyle(BOLD);
    text("Current time", 1053, 69);
    text("Recording time", 1053, 163);
    text("Passengers", 1053, 257);
    textStyle(NORMAL);
    text(currentTime, 1053, 100);
    text(recordingTime, 1053, 194);
    text(peopleNumber, 1053, 288);
  }
}


function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}

function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 1099, 746) <= 35){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 0.Main Page.
      recordingStartTime = millis();
      startLog();
      myVideoRec.startRec(); // start recording video
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 1099, 746) <= 35){ // for Pause BTN
      state = 2; //go to 2.Paused Page from 1.Recording Page.
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 1198, 746) <= 35){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
      myVideoRec.stopRec(); // stop and save the video
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 1099, 746) <= 35){ // for Recording BTN
      state = 1; //go to 1.Recording Page from 2.Paused Page.
      totalPausedTime = totalPausedTime + pausedTime;
    }
    if(dist(mouseX, mouseY, 1198, 746) <= 35){ // for Stop BTN
      state = 3; //go to 3.Saved Page from 1.Recording Page.
      initializeTimes();
      saveLog();
      myVideoRec.stopRec(); // stop and save the video
    }
  }else if(state == 3){
    if(dist(mouseX, mouseY, 1099, 746) <= 35){ // for Recording BTN
      state = 0; //go to 0.Main Page from 3.Saved Page.
    }
  }
}

function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}
function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ //1.Recording Page
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)); //시간은 계속 늘어나도 OK
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ //2.Paused Page
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ //3.Saved Page
    recordingTime = '00:00:00';
  }
}
//==========================COCOSSD ADDED===============================
function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
      //개별 사람마다의 X, Y 좌표값 저장
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
  // 현재 레코딩 타임과 함께 tempMsg 저장
}
//==========================WRITER ADDED===============================
function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}
