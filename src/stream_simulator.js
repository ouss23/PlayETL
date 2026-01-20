export class StreamSimulator {
    constructor({
        data_frame_renderers = [],
        data_stream_renderers = [],
        rowReadDelay = 1 / 2,
        layer,
    }) {
        this.data_frame_renderers = data_frame_renderers;
        this.data_stream_renderers = data_stream_renderers;
        this.rowReadDelay = rowReadDelay;
        this.animationTime = 0;
        this.lastRowReadTime = 0;
        this.read_streams = [];
        this.animation = new Konva.Animation(
            update,
            layer
        );
    }

    update(frame) {
        //const time = frame.time;
        const timeDiff = frame.timeDiff;
        //const frameRate = frame.frameRate;

        this.animationTime += timeDiff / 1000;

        if(this.animationTime > this.lastRowReadTime + rowReadDelay) {
            for(let i = 0; i < data_frame_renderers.length; i++) {
            if(dataframe.rows.length > 0) {
                const row = dataframe.rows.shift();
                stream.push(row, lastRowReadTime + rowReadDelay);
                const rowRenderer = new RowRenderer(row, 100, 100);
                layer.add(rowRenderer.shape);
                streamRenderer.addRowRenderer(rowRenderer);

                this.lastRowReadTime += this.rowReadDelay;
            }
            }
        }

        streamRenderer.updateRows(animationTime);
    }
}