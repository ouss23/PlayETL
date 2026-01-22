import { DataReader } from "./model/data_reader.js";
import { RowRenderer } from "./view/row_renderer.js";

export class StreamSimulator {
    constructor({
        data_frame_renderers = [],
        data_stream_renderers = [],
        dataReaders = [],
        //rowReadDelay = 1 / 2,
        layer,
    }) {
        this.data_frame_renderers = data_frame_renderers;
        this.data_stream_renderers = data_stream_renderers;
        //this.rowReadDelay = rowReadDelay;
        this.animationTime = 0;
        this.lastRowReadTime = 0;
        //console.log("dataReaders.length = " + dataReaders.length);
        this.dataReaders = dataReaders;/*data_stream_renderers.map(
            dsr => dsr.data_stream
        ).filter(
            ds => ds instanceof DataReader
        );*/
        this.layer = layer;
        StreamSimulator.instance = this;
        this.animation = new Konva.Animation(
            //this._update,
            StreamSimulator.updateAll,
            layer
        );
    }

    static instance = null;
    static updateAll(frame) {
        //console.log("updating all...");
        if(StreamSimulator.instance != null)
        {
            //console.log("updating instance");
            StreamSimulator.instance.update(frame);
        }
    }

    update(frame) {
        //const time = frame.time;
        const timeDiff = frame.timeDiff;
        //const frameRate = frame.frameRate;

        this.animationTime += timeDiff / 1000;

        for(let i = 0; i < this.dataReaders.length; i++) {
            const dr = this.dataReaders[i];

            if(!dr.upstream.acceptsRows())
                continue;

            const readRows = dr.update(this.animationTime);

            for(let j = 0; j < readRows.length; j++) {
                //dr.upstream.push(readRows[j].row, readRows[j].arrival_time);
                const rowRenderer = new RowRenderer(readRows[j].row, 100, 100);
                this.layer.add(rowRenderer.shape);

                for(const sr of this.data_stream_renderers) {
                    if(sr.data_stream == dr.upstream) {
                        sr.addRowRenderer(rowRenderer);
                        break;
                    }
                    /*else
                        throw new Error("no matching stream renderer found");*/
                }
            }
        }

        for(let i = 0; i < this.data_stream_renderers.length; i++) {
            const streamRenderer = this.data_stream_renderers[i];
            streamRenderer.updateRows(this.animationTime);
        }





        /*if(this.animationTime > this.lastRowReadTime + rowReadDelay) {
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

        streamRenderer.updateRows(animationTime);*/
    }
}