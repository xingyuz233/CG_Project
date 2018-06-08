class Fog {
    constructor() {
        this.fogColor = new Float32Array([0.137, 0.231, 0.423]);
        // Distance of fog [where fog starts, where fog completely covers object]
        this.fogDist = new Float32Array([50, 160]);
    }
}