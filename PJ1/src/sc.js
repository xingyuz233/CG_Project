//绘制单个四边形
function paintSinglePolygon(singlePolygon, color) {
    for (var y = 0; y < canvasSize.maxY; y++) {
        var sortedPointArray = getPoints(y, singlePolygon).sort(function (a, b) { return a - b });
        //console.log(sortedPointArray);
        switch (sortedPointArray.length) {
            case 0:
                break;
            case 1:
                console.log("bug1\n");
                break;
            case 2:
                drawLine(cxt, sortedPointArray[0], y, sortedPointArray[1], y,color);
                break;
            case 3:
                console.log("bug3\n");
                break;
            case 4:
                drawLine(cxt, sortedPointArray[0], y, sortedPointArray[1], y, color);
                drawLine(cxt, sortedPointArray[2], y, sortedPointArray[3], y, color);
                break;
            default:
                console.log("bug5\n");
        }
    }
}

//直线Y=y与单个四边形的4条边所有相交点
function getPoints(y, singlePolygon) {
    var crossPoints = []; //相交点是四边形某条边上的点（不在顶点上）
    var topPoints = []; //相交点是四边形某条边上的上顶点
    var bottomPoints = []; //相交点是四边形某条边上的下顶点
    var middlePoints = []; //Y=y与某条边所在直线重合，相交点无穷，此时取该边上的两个顶点，叫做中顶点
    var resPoints = [];
    parseEdge(y, vertex_pos[singlePolygon[0]][0], vertex_pos[singlePolygon[0]][1], vertex_pos[singlePolygon[1]][0], vertex_pos[singlePolygon[1]][1]);
    parseEdge(y, vertex_pos[singlePolygon[1]][0], vertex_pos[singlePolygon[1]][1], vertex_pos[singlePolygon[2]][0], vertex_pos[singlePolygon[2]][1]);
    parseEdge(y, vertex_pos[singlePolygon[2]][0], vertex_pos[singlePolygon[2]][1], vertex_pos[singlePolygon[3]][0], vertex_pos[singlePolygon[3]][1]);
    parseEdge(y, vertex_pos[singlePolygon[3]][0], vertex_pos[singlePolygon[3]][1], vertex_pos[singlePolygon[0]][0], vertex_pos[singlePolygon[0]][1]);

    if (middlePoints.length !== 0) {
        resPoints = middlePoints.concat(crossPoints);
        resPoints.sort(function (a, b) { return a - b });
        resPoints = [resPoints[0], resPoints[resPoints.length-1]];
    } else {
        resPoints = resPoints.concat(topPoints);
        for (var i = 0; i < bottomPoints.length; i++) {
            if (!isInArray(bottomPoints[i], topPoints)) {
                resPoints.push(bottomPoints[i]);
            }
        }
        resPoints = resPoints.concat(crossPoints);
    }
    return resPoints;


    //分析Y=y与单个边的关系，添加相交点
    function parseEdge(y, x1, y1, x2, y2) {
        if (y1 > y2) {
            var temp;
            temp = x1;
            x1 = x2;
            x2 = temp;
            temp = y1;
            y1 = y2;
            y2 = temp;
        }

        if (y == y1 && y == y2) {
            middlePoints.push(x1, x2);
        }
        else if (y == y1 && y != y2) {
            bottomPoints.push(x1)
        }
        else if (y != y1 && y == y2) {
            topPoints.push(x2);
        }
        else if (y1 < y && y < y2) {
            var x = (x1 * (y2 - y) + x2 * (y - y1)) / (y2 - y1);
            crossPoints.push(x);
        }
    }


}

//工具函数
function isInArray(value, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true
        }
    }
    return false;
}

function removeByValue(arr, val) {
    for(var i=0; i<arr.length; i++) {
        if(arr[i] === val) {
            arr.splice(i, 1);
            break;
        }
    }
}


var c = document.getElementById("myCanvas");
var cxt=c.getContext("2d");
var isButton = false;
var id = null;
var LRUCache = [0,1,2,3]; //用于记录最近操作过的四边形序号，决定叠层的次序

//将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题，具体原理详见project文档
cxt.translate(0.5, 0.5);

for (var i = 0; i < polygon.length; i++) {
    paintSinglePolygon(polygon[i], vertex_color[polygon[i][0]]);
}
//创建拖动按钮
for (var i = 0;i<vertex_pos.length;i++){
    var button = document.createElement("a");
    button.setAttribute("id",i);
    button.setAttribute("class","Button");
    button.style.left = vertex_pos[i][0] + "px";
    button.style.top = vertex_pos[i][1] + "px";

    document.body.appendChild(button);
}

//事件绑定
document.addEventListener('mousedown',function (ev) {
    if (ev.target.className  == 'Button') {
        isButton = true;
        id = ev.target.id;

        for (var i = 0; i < polygon.length; i++) {
            if (isInArray(parseInt(id), polygon[i])) {
                removeByValue(LRUCache, i);
                LRUCache.push(i);
            }
        }

        //LRU实现层叠顺序策略
        for (var i = 0; i < polygon.length; i++) {
            paintSinglePolygon(polygon[LRUCache[i]], vertex_color[polygon[LRUCache[i]][0]]);
        }
    }
});
document.addEventListener('mousemove',function (ev) {
    if (isButton) {
        var button = document.getElementById(id);
        if (ev.clientX - 10 < canvasSize.maxX && ev.clientY - 10 < canvasSize.maxY && ev.clientX - 10 >= 0 && ev.clientY - 10 >= 0){

            button.style.left=ev.clientX - 10 + 'px';
            button.style.top=ev.clientY - 10 + 'px';
            vertex_pos[id][0]=ev.clientX - 10;
            vertex_pos[id][1]=ev.clientY - 10;

            cxt.clearRect(0,0,canvasSize.maxX,canvasSize.maxY);

            //LRU实现层叠顺序策略
            for (var i = 0; i < polygon.length; i++) {
                paintSinglePolygon(polygon[LRUCache[i]], vertex_color[polygon[LRUCache[i]][0]]);
            }

        }
    }
});
document.addEventListener('mouseup',function (ev) {
    isButton = false;
    id = null;
});

