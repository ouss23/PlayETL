export class TransformerRenderer {
    static plugWidth = 45;
    static plugHeight = 7;

    constructor({
        transformer,
        x = 0,
        y = 0,
        width = 150,
        height = 60,
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

        this.layout = new Konva.Shape({
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

        this.title = new Konva.Text({
            x: 0,
            y: 10,
            text: '⚙️Filter',
            fontSize: 18,
            fontFamily: 'Avenir',
            fill: '#555',
            align: 'center',
            width: width,
            height: height + 30,
        });

        this.content = new Konva.Text({
            x: 0,
            y: 32,
            text: 'color = green',
            fontSize: 14,
            fontFamily: 'Avenir',
            fill: '#555',
            align: 'center',
            width: width,
            height: height + 30,
        });

        this.shape.add(this.layout);
        this.shape.add(this.title);
        this.shape.add(this.content);
    }
}