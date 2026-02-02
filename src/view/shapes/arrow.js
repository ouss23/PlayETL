export class Arrow {
    constructor({
        startX = 0,
        startY = 0,
        endX = 50,
        endY = 50,
        lineWidth = 10,
        pointerWidth = 15,
        pointerHeight = 10,
        fill = "gray",
    }) {
        const vect = {
            x: endX - startX,
            y: endY - startY,
        };
        const length = Math.sqrt(vect.x * vect.x + vect.y * vect.y);
        const dir = {
            x: vect.x / length,
            y: vect.y / length,
        }
        const dirCross = {
            x: - dir.y,
            y: dir.x,
        }
        this.shape = new Konva.Shape({
            sceneFunc: function (context, shape) {
                context.beginPath();
                //context.moveTo(0,0);
                context.moveTo(
                    startX + dirCross.x * lineWidth / 2,
                    startY + dirCross.y * lineWidth / 2
                );
                context.lineTo(
                    startX + dirCross.x * lineWidth / 2 + 
                        dir.x * (length - pointerHeight),
                    startY + dirCross.y * lineWidth / 2 +
                        dir.y * (length - pointerHeight)
                );
                context.lineTo(
                    startX + dirCross.x * pointerWidth / 2 + 
                        dir.x * (length - pointerHeight),
                    startY + dirCross.y * pointerWidth / 2 +
                        dir.y * (length - pointerHeight)
                );
                context.lineTo(
                    startX + dir.x * length,
                    startY + dir.y * length
                );
                context.lineTo(
                    startX - dirCross.x * pointerWidth / 2 + 
                        dir.x * (length - pointerHeight),
                    startY - dirCross.y * pointerWidth / 2 +
                        dir.y * (length - pointerHeight)
                );
                context.lineTo(
                    startX - dirCross.x * lineWidth / 2 + 
                        dir.x * (length - pointerHeight),
                    startY - dirCross.y * lineWidth / 2 +
                        dir.y * (length - pointerHeight)
                );
                context.lineTo(
                    startX - dirCross.x * lineWidth / 2,
                    startY - dirCross.y * lineWidth / 2
                );
                context.closePath();
                context.fillStrokeShape(shape);
            },
            //lineJoin: lineJoin,
            fill: fill,
            //stroke: stroke,
            //strokeWidth: strokeWidth,
            x: 0,
            y: 0,
        });
    }
}