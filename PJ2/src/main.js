let canvas = document.getElementById('webgl');
// Get the rendering context for WebGL
let gl = getWebGLContext(canvas);
if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
}
let triangleVertice = initialTriangleVertice();
let selectedVertexIndex = null;
let currentAngle = 0;
let showLineStatus = true;
let animationStatus = false;
let edittingStatus = true;
//用于记录最近操作过的三角形序号，决定叠层的次序
let LRUCache = [0, 1, 2, 3, 4, 5, 6, 7];
//上一帧旋转的时间，用于计算旋转角度，要注意旋转刚刚开始时不能直接直接使用该值
let g_last = Date.now();
//renderInAnimation记录是否是旋转动画的第一帧
let renderInAnimation = false;
initialEvent();
render();

//绑定鼠标事件与键盘事件
function initialEvent() {
    canvas.addEventListener('mousedown', ev => {

        if (edittingStatus) {
            let DRAG_TOLERANCE = 10;
            selectedVertexIndex = getSelectedVertexIndex(ev.offsetX, ev.offsetY, triangleVertice, DRAG_TOLERANCE);

            if (selectedVertexIndex != null) {
                for (let value of LRUCache.slice(0)) {
                    if (isInArray(selectedVertexIndex, triangleVertice[value])) {
                        removeByValue(LRUCache, value);
                        LRUCache.push(value);
                    }
                }
            }

            render();
        }


    });

    canvas.addEventListener('mousemove', ev => {
        if (selectedVertexIndex != null) {
            vertex_pos[selectedVertexIndex][0] = ev.offsetX;
            vertex_pos[selectedVertexIndex][1] = ev.offsetY;
            render();
        }
    });

    canvas.addEventListener('mouseup', ev => {
        selectedVertexIndex = null;
    });

    document.addEventListener('keydown', ev => {
        const KEY_B = 66;
        const KEY_E = 69;
        const KEY_T = 84;
        switch (ev.keyCode) {
            case KEY_B:
                showLineStatus = !showLineStatus;
                render();
                break;
            case KEY_E:
                animationStatus = false;
                edittingStatus = true;
                renderInAnimation = false;
                render();
                break;
            case KEY_T:
                edittingStatus = false;
                animationStatus = !animationStatus;
                renderInAnimation = false;
                animation();
                break;

        }
    });
}
//将config.polygon中的4个矩形转化为8个三角形
function initialTriangleVertice() {
    let triangles = [];
    for (let value of polygon) {
        triangles.push([value[0], value[1], value[2]]);
        triangles.push([value[2], value[3], value[0]]);
    }
    return triangles;
}
//涂色单个三角形
function paintSingleTriangle(triangleVertex, currentAngle, triangleShader) {
    let scale = Math.abs(currentAngle % 360 - 180) / 225  + 0.2;
    let triangleWebglVertex = Transfer.triangle_transfer(
        [vertex_pos[triangleVertex[0]], vertex_pos[triangleVertex[1]], vertex_pos[triangleVertex[2]]],
        [vertex_color[triangleVertex[0]], vertex_color[triangleVertex[1]], vertex_color[triangleVertex[2]]],
        canvasSize["maxX"],
        canvasSize["maxY"],
        scale
    );
    triangleShader.draw(triangleWebglVertex,currentAngle);
}
//涂色所有8个三角形
function paintAllTriangles(triangleVertices, currentAngle, LRUCache) {
    let triangleShader = new TriangleShader(gl);
    triangleShader.initial();
    for (let value of LRUCache) {
        paintSingleTriangle(triangleVertices[value], currentAngle, triangleShader);
    }
}
//绘制单个三角形边框
function drawSingleTriangleLine(triangleVertex, currentAngle, lineShader) {
    let scale = Math.abs(currentAngle % 360 - 180) / 225  + 0.2;
    let lineWebglVertex =
        Transfer.triangle_line_transfer(
            [vertex_pos[triangleVertex[0]], vertex_pos[triangleVertex[1]], vertex_pos[triangleVertex[2]]],
            canvasSize["maxX"],
            canvasSize["maxY"],
            scale
        );
    lineShader.draw(lineWebglVertex, currentAngle);
}
//绘制所有三角形边框
function drawAllTriangleLines(triangleVertice, currentAngle, LRUCache) {
    let lineShader = new LineShader(gl);
    lineShader.initial();
    for (let value of LRUCache) {
        drawSingleTriangleLine(triangleVertice[value], currentAngle, lineShader);
    }
}
//渲染
function render() {
    clearCanvas();
    if (edittingStatus) {
        paintAllTriangles(triangleVertice, 0, LRUCache);
    } else {
        paintAllTriangles(triangleVertice, currentAngle, LRUCache);
    }
    if (showLineStatus) {
        if (edittingStatus) {
            drawAllTriangleLines(triangleVertice, 0, LRUCache);
        } else {
            drawAllTriangleLines(triangleVertice, currentAngle, LRUCache);
        }
    }
}
//帧动画(响应帧动画切换事件的函数)
function animation() {
    if (animationStatus) {
        if (!renderInAnimation) {
            g_last = Date.now();
            renderInAnimation = true;
        }
        currentAngle = rotate(currentAngle);
        render();
        requestAnimationFrame(animation);
    }
}
//根据时间动画时间差进行图像旋转
function rotate(angle) {
    // Calculate the elapsed time
    const ANGLE_STEP = 45;
    let now = Date.now();
    let elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    newAngle %= 360;
    return newAngle;
}
//清除整个canvas
function clearCanvas() {
    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}
//工具函数，返回离x,y在tolerance范围内的顶点序号
function getSelectedVertexIndex(x, y, triangleVertice, tolerance) {
    for (let i = 0; i < vertex_pos.length; i++) {
        if (Math.pow(x - vertex_pos[i][0], 2) + Math.pow(y - vertex_pos[i][1], 2)
            < Math.pow(tolerance, 2)) {
            return i;
        }
    }
    return null;
}
//工具函数，判断value是否在array里面
function isInArray(value, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true
        }
    }
    return false;
}
//工具函数，将arr中值为val的第一个元素去除
function removeByValue(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
            arr.splice(i, 1);
            break;
        }
    }
}


