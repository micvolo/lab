let canvas = document.querySelector("canvas");
let stream = canvas.captureStream();
let recorder = new MediaRecorder(stream);
recorder.start();

let chunks = [];

recorder.ondataavailable = (e) => chunks.push(e.data);

recorder.onstop = () => {
    console.log(recorder)
    let blob = new Blob(chunks, { type: "video/webm" });
    let url = URL.createObjectURL(blob);
    window.open(url);
}

addEventListener("keydown", (e) => {
    if (e.code === "KeyR") {
        if (recorder.state === "recording") {
            recorder.stop();
        } else {
            recorder.start();
        }
    }
});
