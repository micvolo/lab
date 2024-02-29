let canvas = document.querySelector("canvas");
let stream = canvas.captureStream(30);
let recorder = new MediaRecorder(stream);
let chunks = [];
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = () => {
  let blob = new Blob(chunks, { type: "video/webm" });
  let a = document.createElement("a")
  a.setAttribute("href", URL.createObjectURL(blob))
  a.setAttribute("download", "r.webm")
  a.click();
  a.remove();
}

let defaultTitle = document.title;
addEventListener("keydown", (e) => {
  if (e.code === "KeyS") {
    if (recorder.state === "recording") {
      recorder.stop();
      document.title = defaultTitle;
    } else {
      recorder.start();
      document.title = 'Recording | ' + defaultTitle;
    }
  }
});
