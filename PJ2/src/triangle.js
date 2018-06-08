//该类用于三角形内部的渲染
class TriangleShader {
    //绑定绘制工具gl
    constructor(gl) {
        this.gl = gl;

    }
    //定义VSHADER_SOURCE与FSHDER_SOURCE，初始化shader
    initial() {
        // Initialize shaders
        const VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_ModelMatrix;\n' +
            'attribute vec4 a_Color;\n' +
            'varying vec4 v_Color;\n' +
            'void main() {\n' +
            '  gl_Position = u_ModelMatrix * a_Position;\n' +
            '  v_Color = a_Color;\n' +
            '}\n';

        // Fragment shader program
        const FSHADER_SOURCE =
            'precision mediump float;\n' +
            'varying vec4 v_Color;\n' +
            'void main() {\n' +
            '  gl_FragColor = v_Color;\n' +
            '}\n';
        if (!initShaders(this.gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
        }
    }
    //根据vertex初始化buffer，利用currentAngle设置旋转角，绘制图像
    draw(vertex, currentAngle) {
        let gl = this.gl;
        let verticesColors = new Float32Array(vertex);
        let modelMatrix = new Matrix4();
        modelMatrix.setRotate(currentAngle,0,0,1);
        let n = 3;

        // Create a buffer object
        let vertexColorBuffer = gl.createBuffer();
        if (!vertexColorBuffer) {
            console.log('Failed to create the buffer object');
            return false;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

        let FSIZE = verticesColors.BYTES_PER_ELEMENT;
        //Get the storage location of a_Position, assign and enable buffer
        let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

        // Get the storage location of a_Position, assign buffer and enable
        let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
        if (a_Color < 0) {
            console.log('Failed to get the storage location of a_Color');
            return -1;
        }
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
        gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

        // Get storage location of u_ModelMatrix
        let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        if (!u_ModelMatrix) {
            console.log('Failed to get the storage location of u_ModelMatrix');
            return -1;
        }
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);


        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);

    }
    //清理gl
    clear() {
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

    }
}
