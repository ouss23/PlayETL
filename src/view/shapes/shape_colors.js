export class ShapeColor {
    static defaultColors = new Map(
        [
            ["purple", new ShapeColor('#e23b73ff', '#9e4160ff')],
            ["green", new ShapeColor('#3be2c6ff', '#4ca596ff')],
            ["orange", new ShapeColor('hsla(19, 98%, 59%, 1.00)', 'hsla(5, 53%, 55%, 1.00)')],
        ]
    );

    constructor(fill, stroke) {
        this.fill = fill;
        this.stroke = stroke;
    }
}