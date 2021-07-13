var width =  window.screen.width * 0.25
var height= window.screen.height * 0.25

navigator.mediaDevices.getUserMedia({
  video: {
    width: width,
    height: height,
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
    try {
      let src = cv.imread(document.getElementById("canvas"))
      let gray = new cv.Mat();
      let threshold = new cv.Mat();
      let features = new cv.Mat();
      let bilateral = new cv.Mat();
      let roi = new cv.Mat();
      let lines = new cv.Mat();
      let code = new cv.Mat();
      //const canny = new cv.Mat();

      var size = Math.floor(Math.min(width, height) * 0.50)
      var points = [
        new cv.Point(width/2 - size/2, height/2 - size/2), //TOP LEFT
        new cv.Point(width/2 + size/2, height/2 - size/2), //TOP RIGHT
        new cv.Point(width/2 + size/2, height/2 + size/2), // BOTTOM RIGHT
        new cv.Point(width/2 - size/2, height/2 + size/2) //BOTTOM LEFT
      ]
      
      
      var rWidth = Math.floor(Math.max(Math.sqrt( Math.pow((points[0].x-points[1].x), 2) + Math.pow((points[0].y-points[1].y), 2) ), Math.sqrt( Math.pow((points[2].x-points[3].x), 2) + Math.pow((points[2].y-points[3].y), 2) )))
      var rHeight = Math.floor(Math.max(Math.sqrt( Math.pow((points[0].x-points[3].x), 2) + Math.pow((points[0].y-points[3].y), 2) ), Math.sqrt( Math.pow((points[1].x-points[2].x), 2) + Math.pow((points[1].y-points[2].y), 2) )))
      var rect = new cv.Rect(points[0].x, points[0].y, rWidth, rHeight)
      roi = src.roi(rect)
      
      //cv.line(src, points[0], points[1], [255, 0, 0, 255], 1)
      //cv.line(src, points[1], points[2], [255, 0, 0, 255], 1)
      //cv.line(src, points[2], points[3], [255, 0, 0, 255], 1)
      //cv.line(src, points[3], points[0], [255, 0, 0, 255], 1)
      
      cv.cvtColor(roi, gray ,cv.COLOR_BGR2GRAY, 0)
      cv.bilateralFilter(gray, bilateral, 9, 75, 75, cv.BORDER_DEFAULT)
      cv.Canny(bilateral, threshold, 120, 255, 3, true)

      cv.HoughLinesP(threshold, lines, 1, Math.PI / 180, 50, 5, 2);
      let color = new cv.Scalar(255, 0, 0, 255);
      let scolor = new cv.Scalar(0, 255, 0, 255);
      var LSP = null
      var LEP = null
      var LLL = 0

      var SLSP = null
      var SLEP = null
      var SLLL = 0

      for (let i = 0; i < lines.rows; ++i) {
          let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
          let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
          let length = Math.sqrt( Math.pow((startPoint.x-endPoint.x), 2) + Math.pow((startPoint.y-endPoint.y), 2))
          if (length > LLL) {
            LLL = length;
            LSP = startPoint;
            LEP = endPoint
          } else if (length > SLLL) {
            SLLL = length;
            SLSP = startPoint;
            SLEP = endPoint
          }

      }
      cv.imshow('cvCanvas', threshold)
      
      
      if (LSP != null && LEP != null && SLSP != null && SLEP != null) {

        
        var m =  (LSP.y - LEP.y   )/ (LSP.x - LEP.x  )
        var sm = (SLSP.y - SLEP.y )/ (SLSP.x - SLEP.x)

        var b = (LSP.y) - m * (LSP.x)
        var sb = (SLSP.y ) - sm * (SLSP.x)

        var x = ((b-sb)/m - sm) + rWidth/2
        if (!isFinite(x)) {
          x = LSP.x
        }
        var y = m * x + b
        if (!isFinite(y)) {
          y = LSP.y
        }
        var p = new cv.Point(x, y)

        //cv.line(roi, new cv.Point(0, b), new cv.Point(rWidth, rWidth*m + b), new cv.Scalar(0, 0, 255, 255))
        cv.line(roi, LSP, LEP, color);
        cv.line(roi, SLSP, SLEP, scolor);
        if (isFinite(x)) {
          if (isFinite(y)) {
            cv.circle(roi, p, 10, new cv.Scalar(0, 200, 255, 255), -1)
          } else {
            console.log("y = infinity")
          }
        } else {
          console.log("x = infinity")
        }
      }



      // TO DO TMRW!!!!!!!!!!!!!!!! VVVVVVVVVVVVVVVVVVVVVVVV

      //var cWidth = Math.floor(Math.max(Math.sqrt( Math.pow((points[0].x-points[1].x), 2) + Math.pow((points[0].y-points[1].y), 2) ), Math.sqrt( Math.pow((points[2].x-points[3].x), 2) + Math.pow((points[2].y-points[3].y), 2) )))
      //var crHeight = Math.floor(Math.max(Math.sqrt( Math.pow((points[0].x-points[3].x), 2) + Math.pow((points[0].y-points[3].y), 2) ), Math.sqrt( Math.pow((points[1].x-points[2].x), 2) + Math.pow((points[1].y-points[2].y), 2) )))
      //var crect = new cv.Rect(p.x, p.y, rWidth, rHeight)
      //code = roi.roi()
      cv.imshow('roi', roi)

      src.delete(); gray.delete(); threshold.delete(); features.delete(); roi.delete() ; lines.delete(); bilateral.delete(); code.delete();
      showImage0()
    } catch{}
  }, 100)

}

function onOpenCvReady() {
  cv['onRuntimeInitialized']=()=>{
    console.log("ready")
    showImage0()
  }
}
