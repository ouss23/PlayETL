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
        this.dataStreamRenderersMap = new Map(
            data_stream_renderers.map(dsr => [dsr.data_stream, dsr])
        );
        this.rowRenderers = new Map();
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
        if(StreamSimulator.instance != null)
        {
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
                const rowRenderer = this.createRowRenderer(readRows[j].row, 100, 100);
                //this.layer.add(rowRenderer.shape);
                if(this.dataStreamRenderersMap.has(dr.upstream)) {
                    this.dataStreamRenderersMap.get(dr.upstream)
                        .addRowRenderer(rowRenderer);
                }
                else
                    throw new Error("No matching stream renderer found");
            }
        }

        for(let i = 0; i < this.dataReaders.length; i++) {
            let upstream = this.dataReaders[i].upstream;
            while(upstream != null) {
                const dsr = this.dataStreamRenderersMap.has(upstream) ?
                    this.dataStreamRenderersMap.get(upstream) : null;
                
                if(dsr == null)
                    throw new Error("No matching stream renderer found");
                
                dsr.updateRows(this.animationTime);

                if(upstream.upstream != null) {
                    const transferedRows = upstream
                        .pullTransfered(this.animationTime);
                    
                    transferedRows.forEach(r => {
                        upstream.upstream.push(
                            r.row, r.arrival_time + upstream.transfer_delay
                        );

                        dsr.removeRowRenderer(r.row);
                        this.dataStreamRenderersMap.get(upstream.upstream)
                            .addRowRenderer(this.rowRenderers.get(r.row));
                    });
                }

                upstream = upstream.upstream;
            }
        }
    }

    createRowRenderer(row, x, y) {
        if(this.rowRenderers.has(row))
            throw new Error("A renderer already exists for " + row);

        const rowRenderer = new RowRenderer(row, x, y);
        this.rowRenderers.set(row, rowRenderer);
        this.layer.add(rowRenderer.shape);
        return rowRenderer;
    }
}