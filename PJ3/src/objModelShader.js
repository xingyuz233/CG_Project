class ObjModelShader {
    constructor(gl, camera, fog, model) {
        this.gl = gl;
        this.camera = camera;
        this.fog = fog;
        this.model = model;
        this.objDoc = null;
        this.drawingInfo = null;

        const SHADOW_VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '}\n';

// Fragment shader program for generating a shadow map
        const SHADOW_FSHADER_SOURCE =
            '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            'void main() {\n' +
            '  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n' +
            '  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\n' +
            '  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);\n' + // Calculate the value stored into each byte
            '  rgbaDepth -= rgbaDepth.gbaa * bitMask;\n' + // Cut off the value which do not fit in 8 bits
            '  gl_FragColor = rgbaDepth;\n' +
            '}\n';

        const VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'attribute vec4 a_Color;\n' +
            'attribute vec4 a_Normal;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'uniform mat4 u_ModelMatrix;\n' +   // Model matrix
            'uniform mat4 u_NormalMatrix;\n' +
            'uniform vec3 u_DiffuseLight;\n' +   // Diffuse light color
            'uniform vec3 u_LightDirection;\n' + // Diffuse light direction (in the world coordinate, normalized)
            'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
            'uniform vec3 u_PointLightColor;\n' +
            'uniform vec3 u_PointLightPosition;\n' +
            'uniform vec3 u_Color;\n' +
            'uniform vec4 u_Eye;\n' +     // Position of eye point (world coordinates)
            'varying vec4 v_Color;\n' +
            'varying float v_Dist;\n' +
            'varying vec4 v_PositionFromLight;\n' +


            'void main() {\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
            '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +

            '  vec3 pointLightDirection = normalize(u_PointLightPosition - vec3(vertexPosition));\n' +
            '  float pointLightnDotL = max(dot(pointLightDirection, normal), 0.0);\n' +
            '  vec3 pointLightDiffuse = u_PointLightColor * u_Color * pointLightnDotL;\n' +

            '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
            '  vec3 diffuse = u_DiffuseLight * u_Color * nDotL;\n' +
            '  vec3 ambient = u_AmbientLight * u_Color;\n' +

            '  v_Color = vec4(diffuse + ambient + pointLightDiffuse, a_Color.a);\n' +
            '  v_Dist = distance(u_ModelMatrix * a_Position, u_Eye);\n' +

            '}\n';



        const FSHADER_SOURCE =
            '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            'uniform sampler2D u_ShadowMap;\n' +

            'uniform vec3 u_FogColor;\n' + // Color of Fog
            'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point)

            'varying vec4 v_Color;\n' +
            'varying float v_Dist;\n' +
            'varying vec4 v_PositionFromLight;\n' +

            'float unpackDepth(const in vec4 rgbaDepth) {\n' +
            '  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));\n' +
            '  float depth = dot(rgbaDepth, bitShift);\n' + // Use dot() since the calculations is same
            '  return depth;\n' +
            '}\n' +

            'void main() {\n' +
            '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
            '  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);\n' +
            '  float depth = unpackDepth(rgbaDepth);\n' + // Retrieve the z-value from R
            '  float visibility = (shadowCoord.z > depth + 0.005) ? 0.5 : 1.0;\n' +

            '  float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
            '  vec3 color = mix(u_FogColor, vec3(v_Color) * visibility, fogFactor);\n' +
            '  gl_FragColor = vec4(color, v_Color.a);\n' +
            '}\n';

        this.program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
        if (!this.program) {
            console.log('failed to initialize shader');
        }
        // Get the storage locations of attribute and uniform variables
        this.program.a_Position = gl.getAttribLocation(this.program, 'a_Position');
        this.program.a_Normal = gl.getAttribLocation(this.program, 'a_Normal');
        this.program.a_Color = gl.getAttribLocation(this.program, 'a_Color');
        this.program.u_MvpMatrix = gl.getUniformLocation(this.program, 'u_MvpMatrix');
        this.program.u_NormalMatrix = gl.getUniformLocation(this.program, 'u_NormalMatrix');
        this.program.u_ModelMatrix = gl.getUniformLocation(this.program, 'u_ModelMatrix');

        this.program.u_DiffuseLight = gl.getUniformLocation(this.program, 'u_DiffuseLight');
        this.program.u_LightDirection = gl.getUniformLocation(this.program, 'u_LightDirection');
        this.program.u_AmbientLight = gl.getUniformLocation(this.program, 'u_AmbientLight');
        this.program.u_PointLightColor = gl.getUniformLocation(this.program, 'u_PointLightColor');
        this.program.u_PointLightPosition = gl.getUniformLocation(this.program, 'u_PointLightPosition');
        this.program.u_Color = gl.getUniformLocation(this.program, 'u_Color');


        this.program.u_Eye = gl.getUniformLocation(this.program, 'u_Eye');
        this.program.u_FogColor = gl.getUniformLocation(this.program, 'u_FogColor');
        this.program.u_FogDist = gl.getUniformLocation(this.program, 'u_FogDist');

        this.program.u_ShadowMap = gl.getUniformLocation(this.program, 'u_ShadowMap');

        this.shadowProgram = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE);
        this.shadowProgram.a_Position = gl.getAttribLocation(this.shadowProgram, 'a_Position');
        this.shadowProgram.u_MvpMatrix = gl.getUniformLocation(this.shadowProgram, 'u_MvpMatrix');

        this.initFramebufferObject();

        this.readOBJFile(1, true);

    }
    // OBJ File has been read compreatly
    onReadComplete() {
        // Acquire the vertex coordinates and colors from OBJ file
        this.drawingInfo = this.objDoc.getDrawingInfo();
        this.initBuffers();
    }
    // Read a file
    readOBJFile(scale, reverse) {

        let fileName = this.model.objFilePath;
        let request = new XMLHttpRequest();
        let scope = this;
        request.onreadystatechange = function() {

            if (request.readyState === 4 && request.status !== 404) {

                scope.onReadOBJFile(request.responseText,fileName, scale,reverse);
            }
        }
        request.open('GET', fileName, true); // Create a request to acquire the file
        request.send();                      // Send the request
    }

    onReadOBJFile(fileString,fileName,scale,reverse) {

        let objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
        let result = objDoc.parse(fileString, scale, reverse); // Parse the file
        if (!result) {
            console.log("OBJ file parsing error.");
            return;
        }
        this.objDoc = objDoc;
    }

    initBuffers() {
        let gl = this.gl;
        let drawingInfo = this.drawingInfo;
        this.buffers = {
            vertexBuffer: this.initArrayBufferForLaterUse(drawingInfo.vertices, 3, gl.FLOAT),
            normalBuffer: this.initArrayBufferForLaterUse(drawingInfo.normals, 3, gl.FLOAT),
            colorBuffer: this.initArrayBufferForLaterUse(drawingInfo.colors, 4, gl.FLOAT),
            indexBuffer: this.initElementArrayBufferForLaterUse(drawingInfo.indices, gl.UNSIGNED_SHORT)
        };
        this.numIndices = drawingInfo.indices.length;
    }

    initFramebufferObject() {
        let gl = this.gl;
        const OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
        let framebuffer, texture, depthBuffer;

        // Define the error handling function
        let error = function() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
            return null;
        };

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }

        // Create a texture object and set its size and parameters
        texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Create a renderbuffer object and Set its size and parameters
        depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        // Check if FBO is configured correctly
        let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }

        framebuffer.texture = texture; // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.framebuffer = framebuffer;
    }

    // Assign the buffer objects and enable the assignment
    initAttributeVariable(a_attribute, buffer) {
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }

    initArrayBufferForLaterUse(data, num, type) {
        let gl = this.gl;
        let buffer = gl.createBuffer();   // Create a buffer object
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        // Keep the information necessary to assign to the attribute variable later
        buffer.num = num;
        buffer.type = type;

        return buffer;
    }

    initElementArrayBufferForLaterUse(data, type) {
        let gl = this.gl;
        let buffer = gl.createBuffer();　  // Create a buffer object
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

        buffer.type = type;

        return buffer;
    }

    draw() {
        let gl = this.gl;

        const LIGHT_X = 4, LIGHT_Y = 20, LIGHT_Z = 11;
        const OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
        const CANVAS_WIDTH = 400, CANVAS_HEIGHT = 400;
        // Set the vertex coordinates and color

        let modelMatrix = new Matrix4();
        for (let transform of this.model.transform) {
            modelMatrix[transform.type].apply(modelMatrix, transform.content);
        }

        let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        let viewMatrix = this.camera.getMvpMatrix();
        let mvpMatrix = new Matrix4();
        mvpMatrix.concat(viewMatrix);
        mvpMatrix.concat(modelMatrix);


        let viewProjMatrixFromLight = new Matrix4(); // Prepare a view projection matrix for generating a shadow map
        viewProjMatrixFromLight.setPerspective(70.0, CANVAS_WIDTH/CANVAS_HEIGHT, 1.0, 1000.0);
        viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

        let mvpMatrixFromLight = new Matrix4();
        mvpMatrixFromLight.set(viewProjMatrixFromLight);
        mvpMatrixFromLight.concat(modelMatrix);

        if (this.objDoc != null && this.objDoc.isMTLComplete()) {
            this.onReadComplete();
        }

        if (!this.drawingInfo) return;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);               // Change the drawing destination to FBO
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT); // Set view port for FBO
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO

        gl.useProgram(this.shadowProgram);


        this.initAttributeVariable(this.shadowProgram.a_Position, this.buffers.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);

        gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit

        gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.texture);
        gl.uniformMatrix4fv(this.shadowProgram.u_MvpMatrix, false, mvpMatrixFromLight.elements);
        // Pass the model view projection matrix to u_MvpMatrix
        gl.drawElements(gl.TRIANGLES, this.numIndices, this.buffers.indexBuffer.type, 0);



        // normal program 部分
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);   // Change the drawing destination to FBO
        gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Set view port for FBO
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO

        gl.useProgram(this.program);

        // 绘制顶点
        this.initAttributeVariable(this.program.a_Position, this.buffers.vertexBuffer);
        this.initAttributeVariable(this.program.a_Normal, this.buffers.normalBuffer);
        this.initAttributeVariable(this.program.a_Color, this.buffers.colorBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);

        // 绘制阴影
        gl.uniform1i(this.program.u_ShadowMap, 0);  // Pass 0 because gl.TEXTURE0 is enabledする
        gl.uniformMatrix4fv(this.program.u_MvpMatrixFromLight, false, viewProjMatrixFromLight.elements);


        // 实现光照
        gl.uniform3fv(this.program.u_LightDirection, new Vector3(sceneDirectionLight).normalize().elements);
        gl.uniform3fv(this.program.u_AmbientLight, new Vector3(sceneAmbientLight).elements);
        gl.uniform3f(this.program.u_DiffuseLight, 1,1,1);

        if (this.camera.flushLight) {
            gl.uniform3fv(this.program.u_PointLightColor, new Vector3(scenePointLightColor).elements);
            gl.uniform3fv(this.program.u_PointLightPosition, this.camera.eye.elements);
        } else {
            gl.uniform3fv(this.program.u_PointLightColor, new Vector3([0, 0, 0]).elements);
            gl.uniform3fv(this.program.u_PointLightPosition, new Vector3([0, 0, 0]).elements);
        }

        // 实现动画
        if (this.model.animated) {
            let timestamp = new Date().getTime();
            let angle = timestamp / 500 % (2 * Math.PI);

            let centerPoint = new Vector3([0, 5, -5]);
            this.model.transform[0].content = centerPoint.elements;
            let radius = 10;
            let height = 3;
            let directionVector = new Vector3([Math.cos(angle) * radius, Math.cos(angle) * height, Math.sin(angle) * radius]);

            this.model.transform[0].content = VectorAdd(directionVector, centerPoint).elements;
            this.model.transform[1].content[0] = angle * 180 /Math.PI;

        }
        // 实现雾气
        let eyeElements = this.camera.eye.elements;
        let eye = new Float32Array([eyeElements[0], eyeElements[1], eyeElements[2], 1.0]);

        // Pass fog color, distances, and eye point to uniform variable
        gl.uniform3fv(this.program.u_FogColor, this.fog.fogColor); // Colors
        gl.uniform2fv(this.program.u_FogDist, this.fog.fogDist);   // Starting point and end point
        //console.log(this.fog.fogDist);
        gl.uniform4fv(this.program.u_Eye, eye);           // Eye point

        gl.clearColor(this.fog.fogColor[0], this.fog.fogColor[1], this.fog.fogColor[2], 1.0); // Color of Fog





        gl.uniform3fv(this.program.u_Color, this.model.color);

        gl.uniformMatrix4fv(this.program.u_ModelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(this.program.u_NormalMatrix, false, normalMatrix.elements);

        gl.uniformMatrix4fv(this.program.u_MvpMatrix, false, mvpMatrix.elements);

        gl.drawElements(gl.TRIANGLES, this.numIndices, this.buffers.indexBuffer.type, 0);

    }
}