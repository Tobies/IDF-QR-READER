width =  window.innerWdth * 0.5
height= window.innerHeight * 0.5

navigator.mediaDevices.getUserMedia({
  video: {
    width: {ideal: width},
    height: {ideal: height},
    facingMode: 'environment',
    frameRate: 30
  }
}
).then(function(stream) {
let video = document.getElementById('video');
video.style.display = "none";
video.srcObject = stream;
  
let stream_settings = stream.getVideoTracks()[0].getSettings();
video.onloadedmetadata = function(e) {
  video.play();
};
}).catch(function(err) {
// deal with an error (such as no webcam)
});


video.addEventListener('play', function() {
// trigger business logic
  var canvas = document.getElementById('canvas');
  canvas.width  = width
  canvas.height = height
  canvas.style.display = "none";

  var context = canvas.getContext('2d');

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  function draw(video, canvas, context, frameRate) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setTimeout(draw, 1/frameRate, video, canvas, context, frameRate);
  }
  draw(video, canvas, context, 5);
  // video 'play' event listener
}, false);




const showImage0 = () => {
  setTimeout(() => {

      const src = cv.imread(document.getElementById("canvas"))
      const gray = new cv.Mat();
      const threshold = new cv.Mat();
      const features = new cv.Mat();
      //const canny = new cv.Mat();
      cv.cvtColor(src, gray ,cv.COLOR_BGR2GRAY, 0)
      cv.Canny(gray, threshold, 120, 255, 3, true)
      cv.goodFeaturesToTrack(threshold, features,100,0.5,10)
      //for (var i = 0; i < features.data32F.length; i+=2) {
      //  cv.circle(src, new cv.Point(features.data32F[i], features.data32F[i+1]), 2, new cv.Scalar(255, 200, 0), -1)
      //}
      
      var size = Math.floor(Math.min(width, height) * 0.50)
      var points = [
        new cv.Point(width/2 - size/2, height/2 - size/2), //TOP LEFT
        new cv.Point(width/2 + size/2, height/2 - size/2), //TOP RIGHT
        new cv.Point(width/2 + size/2, height/2 + size/2), // BOTTOM RIGHT
        new cv.Point(width/2 - size/2, height/2 + size/2) //BOTTOM LEFT
      
      ]
      var scalar = new cv.Scalar(255, 255, 255);
      cv.line(src, points[0], points[1], [255, 0, 0, 255], 1)
      cv.line(src, points[1], points[2], [255, 0, 0, 255], 1)
      cv.line(src, points[2], points[3], [255, 0, 0, 255], 1)
      cv.line(src, points[3], points[0], [255, 0, 0, 255], 1)
      for (var i = 0; i < points.length; i++) {
        var closestDistance = 10000
        var closestPoint = null
        for (var j = 0; j < features.data32F.length; j+=2) {
          var distance = Math.sqrt( Math.pow((points[i].x-features.data32F[j]), 2) + Math.pow((points[i].y-features.data32F[j+1]), 2) );
          if (distance < closestDistance) {
            closestDistance = distance
            closestPoint = new cv.Point(features.data32F[j], features.data32F[j+1])
          }
        }
        //console.log(closestPoint)
        if (closestPoint != null) {
          cv.circle(src, closestPoint, 5, scalar, -1)
        }
      }

      
      cv.imshow('cvCanvas', src)

      src.delete(); gray.delete(); threshold.delete(); features.delete()
      showImage0()

  }, 100)

}

function onOpenCvReady() {
  cv['onRuntimeInitialized']=()=>{
    console.log("ready")
    showImage0()
  }
}
