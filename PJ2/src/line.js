//该类用于三角形边框的渲染
class LineShader {
    //绑定绘制工具gl
    constructor(gl) {
        this.gl = gl;
    }
    //定义VSHADER_SOURCE与FSHDER_SOURCE，初始化shader。
    initial() {
        // Initialize shaders
        const VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_ModelMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_ModelMatrix * a_Position;\n' +
            '}\n';

        const FSHADER_SOURCE =
            'void main() {\n' +
            '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
            '}\n';
        // Initialize shaders
        if (!initShaders(this.gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
        }
    }
    //根据vertex初始化buffer，利用currentAngle设置旋转角，绘制图像
    draw(vertex, currentAngle) {
        let gl = this.gl;
        let vertices = new Float32Array(vertex);
        let modelMatrix = new Matrix4();
        modelMatrix.setRotate(currentAngle,0,0,1);
        let n = 3; // The number of vertices

        // Create a buffer object
        let vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Get storage location of u_ModelMatrix
        let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        if (!u_ModelMatrix) {
            console.log('Failed to get the storage location of u_ModelMatrix');
            return -1;
        }
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

        // Draw the rectangle
        gl.drawArrays(gl.LINE_LOOP, 0, n);
    }
    //清理gl
    clear() {
        // Specify the color for clearing <canvas>
        gl.clearColor(0, 0, 0, 1);

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}

