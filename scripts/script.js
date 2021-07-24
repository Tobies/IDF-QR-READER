let gridSize = 13;
let src;
let image;
let points;
let selected = 0
let pause = false

function onOpenCvReady() {
    cv['onRuntimeInitialized']=()=>{
        document.getElementById("sizeButton").onchange = function() {imageUploaded()}
        document.getElementById("TL-BUTTON").onclick = function() {selectTL()}
        document.getElementById("TR-BUTTON").onclick = function() {selectTR()}
        document.getElementById("LL-BUTTON").onclick = function() {selectLL()}
        document.getElementById("LR-BUTTON").onclick = function() {selectLR()}
        document.getElementById("outCanvas").onclick = function() {canvasClick()}
        document.getElementById("READ-BUTTON").onclick = function() {readQr()}
        document.getElementById("BACK-BUTTON").onclick = function() {location.replace("https://tobies.github.io/IDF-QR-READER")}
    }
}

function selectTL() {
    selected = 0
}

function selectTR() {
    selected = 1
}

function selectLL() {
    selected = 2
}

function selectLR() {
    selected = 3
}

function canvasClick() {
    var point = {x:event.offsetX, y:event.offsetY}
    points[selected] = new cv.Point(point.x, point.y)
}

function distance(p1, p2) {
    return Math.sqrt( Math.pow((p1.x-p2.x), 2) + Math.pow((p1.y-p2.y), 2));
}

var symbols = {
    "0000":"0",
    "0001":"1",
    "0010":"2",
    "0011":"3",
    "0100":"4",
    "0101":"5",
    "0110":"6",
    "0111":"7",
    "1000":"8",
    "1001":"9",
    "1010":"&",
    "1011":"$",
    "1100":" ",
    "1101":" ",
    "1110":" ",
    "1111":"~"
  }

function unsymbolize(text) {
    r = ""
    currentSymbol = ""
    for (var i = 0; i < text.length; i++) {
      currentSymbol += text[i];
      if (currentSymbol.length == 4) {
        if (currentSymbol in symbols) {
          r += symbols[currentSymbol]
          if (symbols[currentSymbol] == "~") {
            return r
          }
        }
        currentSymbol = ""
      }
    }
    return r
  }

function symbolize(code) {
    var x = 1
    var y = gridSize - 2
    var r = ""
    while (y > 0) {
      while (x < gridSize - 1) {
        r += 1 - (code.ucharPtr(y, x)[0]/255)
        x += 1
      }
      y -= 1
      x = 1
    }
    prompt((unsymbolize(r)))
  }

function readQr() {
    pause = true
    let out = new cv.Mat()
    src = cv.imread(document.getElementById("img"))
    let code = cv.Mat.zeros(gridSize, gridSize, cv.CV_8U)
    
    var width = document.getElementById("outCanvas").getBoundingClientRect().width;
    var height = document.getElementById("outCanvas").getBoundingClientRect().height;
    var prespectivePoints = [];
    for (var p = 0; p < points.length; p++) {
        var x = Math.round(points[p].x * (src.cols/width))
        var y = Math.round(points[p].y * (src.rows/height))
        prespectivePoints.push({x:x, y:y})
    }
    var length = Math.floor(Math.max(distance(prespectivePoints[0], prespectivePoints[1]), distance(prespectivePoints[2], prespectivePoints[3])))
    let dsize = new cv.Size(length, length);
    
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [prespectivePoints[0].x, prespectivePoints[0].y, prespectivePoints[1].x, prespectivePoints[1].y, prespectivePoints[2].x, prespectivePoints[2].y, prespectivePoints[3].x, prespectivePoints[3].y]);
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, length, 0, 0, length, length, length]);
    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, out, M, dsize, cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar());

    var data = []
    var tile = length/gridSize
    for (var x = 0; x < length; x+=tile) {
        var row = []
        for (var y = 0; y < length; y+= tile) {
            var sum = 0
            for (var oX = 0; oX < tile; oX += 1) {
                for (var oY = 0; oY < tile; oY += 1) {
                    sum += out.ucharPtr(x + oX, y + oY)[0];
                }
            }
            var average = sum / (tile * tile); 
            row.push(average < 127.5)
        }
        data.push(row)
    }

    for (var x = 0; x < gridSize; x++) {
        for (var y = 0; y< gridSize; y++) {
          cv.rectangle(out, new cv.Point(x * tile, y * tile), new cv.Point(x*tile + tile, y*tile + tile), [255, 0, 0, 255], 1)
            if (data[x][y]) {
              code.ucharPtr(x, y)[0] = 0
            } else {
              code.ucharPtr(x, y)[0] = 255
            }
        }
    }
    cv.imshow("testing", out)

    cv.imshow("code", code)
    symbolize(code)

    srcTri.delete(); dstTri.delete(); M.delete(); out.delete(); code.delete(); src.delete
    pause = false
}

function imageUploaded() {
    var value = document.getElementById("size-input").value
    if (value != "") {
        gridSize = Number(document.getElementById("size-input").value);
        document.getElementById("img").src = URL.createObjectURL(document.getElementById("sizeButton").files[0]);
        document.getElementById("sizeDiv").hidden = true
        document.getElementById("cornersDiv").hidden = false
        var width = document.getElementById("outCanvas").getBoundingClientRect().width;
        var height = document.getElementById("outCanvas").getBoundingClientRect().height;
        var size = Math.floor(Math.min(width, height))/2
        points = [
            new cv.Point(width/2 - size/2, height/2 - size/2), //TOP LEFT
            new cv.Point(width/2 + size/2, height/2 - size/2), //TOP RIGHT
            new cv.Point(width/2 - size/2, height/2 + size/2), //BOTTOM LEFT
            new cv.Point(width/2 + size/2, height/2 + size/2) // BOTTOM RIGHT
          ]
        showImage()
    }
}


const showImage = () => {
    setTimeout(() => {
        
        src = cv.imread(document.getElementById("img"))
        
        var width = document.getElementById("outCanvas").getBoundingClientRect().width;
        var height = document.getElementById("outCanvas").getBoundingClientRect().height;
        let out = new cv.Mat();
        cv.resize(src, out, new cv.Size(width, height), 0, 0, cv.INTER_AREA)
        for (var p = 0; p < points.length; p++) {
            if (p == selected) {
              cv.circle(out, points[p], 3, [0, 0, 255, 255], -3)
            } else {
              cv.circle(out, points[p], 3, [255, 0, 0, 255], -3)
            }
          }
        cv.imshow("outCanvas", out);
        showImage()
        out.delete(); src.delete()
    }, 50)
}