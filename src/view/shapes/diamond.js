export function createDiamond({
    x = 0,
    y = 0,
    radius = 10,
    fill = 'white',
    stroke = 'black',
    strokeWidth = 4,
    lineJoin = 'bevel',
}) {
    return new Konva.Shape({
        sceneFunc: function (context, shape) {
            context.beginPath();
            context.moveTo(-radius, 0);
            context.lineTo(0, radius);
            context.lineTo(radius, 0);
            context.lineTo(0, -radius);
            context.closePath();
            context.fillStrokeShape(shape);
        },
        lineJoin: lineJoin,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        x: x,
        y: y,
    });
}