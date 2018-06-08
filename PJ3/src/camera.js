class Camera {
    constructor(CameraPara, aspect) {
        this.eye = new Vector3(CameraPara.eye);
        this.at = new Vector3(CameraPara.at);
        this.up = new Vector3(CameraPara.up);
        this.fov = CameraPara.fov;
        this.near = CameraPara.near;
        this.far = CameraPara.far;
        this.aspect = aspect;

    }

    getMvpMatrix() {
        let mvpMatrix = new Matrix4();
        mvpMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
        mvpMatrix.lookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        return mvpMatrix;
    }

    translate(x,y,z) {
        let directionVector = VectorMinus(this.at, this.eye);

        let localZ = directionVector.normalize();
        let localY = this.up;
        let localX = VectorCross(localZ, localY);
        let increaseVector = VectorAdd(
            VectorAdd(VectorMultNum(localZ, z),VectorMultNum(localX, x)), VectorMultNum(localY, y));
        this.eye = VectorAdd(this.eye, increaseVector);
        this.at = VectorAdd(this.at, increaseVector);

    }
    rotate(angle) { //弧度制
        let directionVector = VectorMinus(this.at, this.eye);
        let baseVector = VectorMultNum(directionVector, Math.cos(angle));
        let verticalVector = VectorMultNum(VectorCross(directionVector, this.up), Math.sin(angle));
        let newDirectionVector = VectorAdd(baseVector, verticalVector);
        this.at = VectorAdd(this.eye, newDirectionVector);

    }
}