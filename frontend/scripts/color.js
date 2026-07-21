class RGBColor {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    rgbString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    static lerp(color1, color2, t) {
        return new RGBColor(
            lerp(color1.r, color2.r, t),
            lerp(color1.g, color2.g, t),
            lerp(color1.b, color2.b, t)
        );
    }
}

// Linear interpolation
function lerp(start, end, t) {
    return Math.floor(start + (end - start) * t);
}

export { RGBColor };