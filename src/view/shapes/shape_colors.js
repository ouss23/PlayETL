export class ShapeColor {
    static defaultColors = new Map(
        [
            ["purple", new ShapeColor('#e23b73ff', '#9e4160ff')],
            ["green", new ShapeColor('#3be2c6ff', '#4ca596ff')],
            ["orange", new ShapeColor('hsla(25, 98%, 59%, 1.00)', 'hsla(25, 51%, 51%, 1.00)')],
        ]
    );

    constructor(fill, stroke) {
        this.fill = fill;
        this.stroke = stroke;
    }
}