export class TransformerRenderer {
    static plugWidth = 45;
    static plugHeight = 7;

    constructor({
        transformer,
        x = 0,
        y = 0,
        width = 150,
        height = 60,
        //temporary for testing
        displayTexts = null,
        //temporary for testing
        displayContents = null,
    }) {
        this.transformer = transformer;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.shape = new Konva.Group({
            x: x,
            y: y,
            //draggable: true,
        });
    
        transformer.dataFrameTransformers.toReversed().forEach(
            (t, i) => this.shape.add(
                TransformerRenderer.drawSingleTransformer(
                    t,
                    0,
                    i * height,
                    width,
                    height,
                    displayTexts == null ? null : displayTexts.toReversed()[i],
                    displayContents == null ? null : displayContents.toReversed()[i]
                )
            )
        );
    }

    static drawSingleTransformer(
        transformer,
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
                context.lineTo((width - TransformerRenderer.plugWidth) / 2, 0);
                context.lineTo(
                    (width - TransformerRenderer.plugWidth * 0.8) / 2,
                    -TransformerRenderer.plugHeight
                );
                context.lineTo(
                    (width + TransformerRenderer.plugWidth * 0.8) / 2,
                    -TransformerRenderer.plugHeight
                );
                context.lineTo((width + TransformerRenderer.plugWidth) / 2, 0);
                context.lineTo(width, 0);
                context.lineTo(width, height);
                context.lineTo(
                    (width + TransformerRenderer.plugWidth) / 2,
                    height
                );
                context.lineTo(
                    (width + TransformerRenderer.plugWidth * 0.8) / 2,
                    height - TransformerRenderer.plugHeight
                );
                context.lineTo(
                    (width - TransformerRenderer.plugWidth * 0.8) / 2,
                    height - TransformerRenderer.plugHeight
                );
                context.lineTo(
                    (width - TransformerRenderer.plugWidth ) / 2,
                    height
                );
                context.lineTo(0, height);
                context.closePath();
                context.fillStrokeShape(shape);
            },
            lineJoin: 'bevel',
            fill: '#b3b2b2ff',
            //draggable: true,
            cornerRadius: 10,
            stroke: '#555',
            strokeWidth: 2,
            x: 0,
            y: 0,
        });

        const title = new Konva.Text({
            x: 0,
            y: 10,
            text: displayText == null ? '⚙️Filter' : displayText,
            fontSize: 18,
            fontFamily: 'Avenir',
            fill: '#555',
            align: 'center',
            width: width,
            height: height + 30,
        });

        const content = new Konva.Text({
            x: 0,
            y: 32,
            text: displayContent == null ? 'color = green' : displayContent,
            fontSize: 14,
            fontFamily: 'Avenir',
            fill: '#555',
            align: 'center',
            width: width,
            height: height + 30,
        });

        group.add(layout);
        group.add(title);
        group.add(content);

        return group;
    }
}