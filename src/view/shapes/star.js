export function createStar({
    x = 0,
    y = 0,
    radius = 10,
    innerRadiusRatio = 0.6,
    fill = 'white',
    stroke = 'black',
    strokeWidth = 4,
    lineJoin = 'bevel',
}) {
    return new Konva.Shape({
        sceneFunc: function (context, shape) {
            context.beginPath();
            context.moveTo(0, -radius);
            const angleStep = 2 * Math.PI / 5;
            context.lineTo(
                -radius * innerRadiusRatio * Math.cos(angleStep / 2 + Math.PI / 2),
                -radius * innerRadiusRatio * Math.sin(angleStep / 2 + Math.PI / 2)
            );
            for(
                let angle = angleStep + Math.PI / 2;
                angle < Math.PI * (2 + 1 / 2);
                angle += angleStep
            )
            {
                context.lineTo(
                    -radius * Math.cos(angle),
                    -radius * Math.sin(angle)
                );
                context.lineTo(
                    -radius * innerRadiusRatio * Math.cos(angle + angleStep / 2),
                    -radius * innerRadiusRatio * Math.sin(angle + angleStep / 2)
                );
            }
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