
function main() {
    // Retrieve <canvas> element
    let canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);


    let camera = new Camera(CameraPara, canvas.width/canvas.height);
    let fog = new Fog();
    let controller = new KeyController(camera, fog);

    let boxResShader = new TextureModelShader(gl, camera, fog, boxRes);
    let floorResShader = new TextureModelShader(gl, camera, fog, floorRes);
    let objShaderList = [];
    for (let value of ObjectList) {

        objShaderList.push(new ObjModelShader(gl, camera, fog, value));
    }
    let lastTime = Date.now();
    let tick = function() {
        //modelShader.clear();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers

        let nowTime = Date.now();
        let elapse = nowTime - lastTime;
        lastTime = nowTime;
        controller.update(elapse / 1000);
        boxResShader.draw();
        floorResShader.draw();
        for (let objShader of objShaderList) {
            objShader.draw();
        }

        document.getElementById('messageBox').innerText =
            "debug message:\n" +
            "position: "+camera.eye.elements+"\n"+
            "lookat: "+camera.at.elements+"\n"+
            "fog distance: "+fog.fogDist[1]+"\n";
        document.getElementById('guideBox').innerText =
            "guideline:\n" +
            "W: move forward    S: move backward\n"+
            "A: move left       D: move right\n"+
            "J: rotate left     K: rotate right\n" +
            "F: turn on the point light\n" +
            "arrow_up: increase fog distance\n"+
            "arrow_down: decrease fog distance\n";

        /*
        modelShader.draw(boxRes);
        modelShader.draw(floorRes);


        for (let value of ObjectList) {
            modelShader.draw(value);
        }
        */

        requestAnimationFrame(tick);
    };
    tick();

}