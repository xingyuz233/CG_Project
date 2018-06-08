class KeyController {
    constructor(camera, fog) {
        this.camera = camera;
        this.fog = fog;

        this.rotateRight = false;
        this.rotateLeft = false;
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backword = false;
        document.addEventListener('keydown', ev => {
            let key = String.fromCharCode(event.which);
            console.log(key);
            /*
            const KEY_B = 66;
            const KEY_E = 69;
            const KEY_T = 84;
            */
            switch (key) {
                case 'W':
                    this.forward = true;
                    break;
                case 'S':
                    this.backword = true;
                    break;
                case 'A':
                    this.left = true;
                    break;
                case 'D':
                    this.right = true;
                    break;
                case 'J':
                    this.rotateLeft = true;
                    break;
                case 'K':
                    this.rotateRight = true;
                    break;
                case 'F':
                    this.camera.flushLight = true;
                    break;
                case '&':
                    this.fog.fogDist[1] += 1;
                    break;
                case '(':
                    if (this.fog.fogDist[1] > this.fog.fogDist[0]) {
                        this.fog.fogDist[1] -= 1;
                    }
                    break;
            }
        });

        document.addEventListener('keyup', ev => {
            let key = String.fromCharCode(event.which);
            /*
            const KEY_B = 66;
            const KEY_E = 69;
            const KEY_T = 84;
            */
            switch (key) {
                case 'W':
                    this.forward = false;
                    break;
                case 'S':
                    this.backword = false;
                    break;
                case 'A':
                    this.left = false;
                    break;
                case 'D':
                    this.right = false;
                    break;
                case 'J':
                    this.rotateLeft = false;
                    break;
                case 'K':
                    this.rotateRight = false;
                    break;
                case 'F':
                    this.camera.flushLight = false;
                    break;

            }
        });
    }

    update(delta) {
        const MOVE_SPEED = 30;
        const ROTATE_SPEED = 60 * Math.PI/180;
        //change camera position

        let z_increase = Number(this.forward) - Number(this.backword);
        let x_increase = Number(this.right) - Number(this.left);

        if (z_increase * x_increase !== 0) {
            z_increase *= Math.cos(45 * Math.PI/180);
            x_increase *= Math.sin(45 * Math.PI/180);
        }
        this.camera.translate(x_increase * MOVE_SPEED * delta, 0, z_increase * MOVE_SPEED * delta);

        //change camera angle
        let rotate_increase = Number(this.rotateRight - this.rotateLeft);
        let angle = rotate_increase * ROTATE_SPEED * delta;
        this.camera.rotate(angle);

    }
}