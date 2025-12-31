export class ShapeColor {
    static defaultColors = new Map(
        [
            ["purple", new ShapeColor('#e23b73ff', '#9e4160ff')],
            ["green", new ShapeColor('#3be2c6ff', '#4ca596ff')],
        ]
    );

    constructor(fill, stroke) {
        this.fill = fill;
        this.stroke = stroke;
    }
}