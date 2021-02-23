let recordedBlobs;
let mediaRecorder;
let timeout;

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720
  }
}

// Get access to button nodes
const startButton = document.getElementById('start');
const recordButton = document.getElementById('record');
const playButton = document.getElementById('play');
const downloadButton = document.getElementById('download');
const screensharingButton = document.getElementById('screensharing');
const snapshotButton = document.getElementById('snapshot');
const filterOptions = document.querySelector('#filter');

// Get access to video nodes
const gumVideo = document.getElementById('gum');
const record = document.querySelector('.record');

// Get access to canvas node
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const filterSelect = document.querySelector('select#filter');

// 1. Screensharing video
screensharingButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
    .then(handleSuccess, handleError);
})

// 2. Download recorded video
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {
    type: "video/webm;codecs=vp9,opus"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "download-video.webm";
  a.click();
  window.URL.revokeObjectURL(url);
})

// 3. Take snapshot
function getArrayValue() {
  const options = [...filterOptions.children];
  const arrValue = options.map(option => option.value);

  return arrValue;
}

filterSelect.addEventListener('change', () => {
  const arrValue = getArrayValue();

  arrValue.forEach((value) => {
    if (gumVideo.classList.contains(value)) {
      gumVideo.classList.remove(value);
    }
  });

  gumVideo.classList.add(filterSelect.value);

});

function playAudio() {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = 'snapshot.mp3';
  audio.play();
}

snapshotButton.addEventListener('click', () => {
  if (!!timeout) clearTimeout(timeout);
  canvas.className = filterSelect.value;
  canvas.width = 300;
  canvas.height = 180;
  playAudio();
  ctx.drawImage(gumVideo, 0, 0, canvas.width, canvas.height);

  timeout = setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 3000);

})

// 4. Play recorded video
playButton.addEventListener('click', () => {
  if (playButton.textContent === 'Play') {
    playButton.textContent = 'Stop Playing';
    recordButton.disabled = true;
    screensharingButton.disabled = true;
    const buffer = new Blob(recordedBlobs, {type: 'video/webm'});
    gumVideo.src = null;
    gumVideo.srcObject = null;
    gumVideo.src = window.URL.createObjectURL(buffer);
    gumVideo.controls = true;
    gumVideo.play();
  } else {
    playButton.textContent = 'Play';
    gumVideo.controls = false;
    init(constraints);
  }

})

// 5. Record video
const handleDataAvailable = (event) => {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

const startRecording = () => {
  recordedBlobs = [];
  const options = {
    mimeType: 'video/webm;codecs=vp9,opus'
  }

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (error) {
    handleError(error);
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
}

const stopRecording = () => {
  mediaRecorder.stop();
}

recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Record') {
    recordButton.textContent = 'Stop recording';
    startRecording();
    record.classList.add('active');
    playButton.disabled = true;
    playButton.textContent = 'Play';
    downloadButton.disabled = true;
  } else {
    recordButton.textContent = 'Record';
    playButton.disabled = false;
    downloadButton.disabled = false;
    record.classList.remove('active');

    stopRecording();
  }
})

// 6. Stream data
const handleSuccess = (stream, screensharing = false) => {
  gumVideo.srcObject = stream;
  window.stream = stream;
  recordButton.disabled = false;
  snapshotButton.disabled = false;
  screensharingButton.disabled = false;
  filterSelect.disabled = false;

  if (screensharing) {
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      startButton.disabled = false;
    });
  }
}

const handleError = (error) => {
  console.error(`navigator getUserMedia error: ${error}`);
}

const init = (constraints) => {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError)
}

startButton.addEventListener('click', () => {
  if (startButton.innerText === 'Start Camera') {
    startButton.innerText = 'Stop Camera';

    init(constraints);
  } else {
    startButton.innerText = 'Start Camera';
    playButton.textContent = 'Play';
    recordButton.textContent = 'Record';
    recordButton.disabled = true;
    playButton.disabled = true;
    downloadButton.disabled = true;
    screensharingButton.disabled = true;
    snapshotButton.disabled = true;
    filterSelect.disabled = true;
    filterSelect.selectedIndex = 0;
    window.stream = null;
    gumVideo.className = 'gum';
    gumVideo.srcObject = null;
    gumVideo.srcObject = null;
    gumVideo.src = null;
    gumVideo.controls = false;
    record.classList.remove('active');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
})
