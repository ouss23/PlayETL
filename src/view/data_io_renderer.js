import { SnappableShape } from "./snappable_shape.js";
import { TransformerRenderer } from "./transformer_renderer.js";

export class IOOperationType {
    static READ = new IOOperationType(0);
    static WRITE = new IOOperationType(1);

    constructor(id) {
        this.id = id;
    }
}

export class DataIORenderer {
    static plugWidth = 45;
    static plugHeight = 7;

    constructor({
        dataFrame,
        operationType = IOOperationType.READ,
        x = 0,
        y = 0,
        width = 150,
        height = 60,
        //temporary for testing
        displayText = null,
        //temporary for testing
        displayContent = null,
    }) {
        this.dataFrame = dataFrame;
        this.operationType = operationType;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.snappableShape = new SnappableShape({
            parent: this,
            shape: new Konva.Group({
                x: x,
                y: y,
                draggable: true,
            }),
            topCondition: (self, other) =>
                (operationType == IOOperationType.READ) &&
                (other.parent instanceof TransformerRenderer ||
                    other.parent instanceof DataIORenderer),
            bottomCondition: (self, other) =>
                (operationType == IOOperationType.WRITE) &&
                (other.parent instanceof TransformerRenderer ||
                    other.parent instanceof DataIORenderer),
            topSnapPoints: (operationType == IOOperationType.READ) ?
                [{
                    x: width / 2,
                    y: 0
                }] : [],
            bottomSnapPoints: (operationType == IOOperationType.READ) ?
                [] :
                [{
                    x: width / 2,
                    y: height
                }],
        });
    
        this.snappableShape.shape.add(
            DataIORenderer.drawShape(
                operationType,
                0,
                0,
                width,
                height,
                displayText,
                displayContent
            )
        );
    }

    static drawShape(
        operationType,
        x,
        y,
        width,
        height,
        displayText = null,
        displayContent = null
    ) {
        const group = new Konva.Group({
            x: x,
            y: y,
        });

        const layout = new Konva.Shape({
            sceneFunc: function (context, shape) {
                context.beginPath();
                context.moveTo(0, 0);
                if(operationType == IOOperationType.READ) {
                    context.lineTo((width - DataIORenderer.plugWidth) / 2, 0);
                    context.lineTo(
                        (width - DataIORenderer.plugWidth * 0.8) / 2,
                        -DataIORenderer.plugHeight
                    );
                    context.lineTo(
                        (width + DataIORenderer.plugWidth * 0.8) / 2,
                        -DataIORenderer.plugHeight
                    );
                    context.lineTo((width + DataIORenderer.plugWidth) / 2, 0);
                }
                context.lineTo(width, 0);
                context.lineTo(width, height);
                if(operationType == IOOperationType.WRITE) {
                    context.lineTo(
                        (width + DataIORenderer.plugWidth) / 2,
                        height
                    );
                    context.lineTo(
                        (width + DataIORenderer.plugWidth * 0.8) / 2,
                        height - DataIORenderer.plugHeight
                    );
                    context.lineTo(
                        (width - DataIORenderer.plugWidth * 0.8) / 2,
                        height - DataIORenderer.plugHeight
                    );
                    context.lineTo(
                        (width - DataIORenderer.plugWidth ) / 2,
                        height
                    );
                }
                context.lineTo(0, height);
                context.closePath();
                context.fillStrokeShape(shape);
            },
            lineJoin: 'bevel',
            fill: '#eed68eff',
            //draggable: true,
            cornerRadius: 10,
            stroke: '#6f4b25ff',
            strokeWidth: 2,
            x: 0,
            y: 0,
        });

        const title = new Konva.Text({
            x: 0,
            y: 10,
            text: displayText == null ? 'DataIO' : displayText,
            fontSize: 18,
            fontFamily: 'Avenir',
            fill: '#6f4b25ff',
            align: 'center',
            width: width,
            height: height - 30,
        });

        const content = new Konva.Text({
            x: 0,
            y: 32,
            text: displayContent == null ? 'no source' : displayContent,
            fontSize: 14,
            fontFamily: 'Avenir',
            fill: '#6f4b25ff',
            align: 'center',
            width: width,
            height: height - 30,
        });

        group.add(layout);
        group.add(title);
        group.add(content);

        return group;
    }
}