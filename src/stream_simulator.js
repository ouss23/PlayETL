import { DataFrame } from "./model/data_frame.js";
import { DataReader } from "./model/data_reader.js";
import { DataStream } from "./model/data_stream.js";
import { DataStreamTransformer } from "./model/data_stream_transformer.js";
import { DataStreamRenderer } from "./view/data_stream_renderer.js";
import { RowRenderer } from "./view/row_renderer.js";
import { DataFrameRenderer } from "./view/data_frame_renderer.js";

export class StreamSimulator {
    constructor({
        data_frame_renderers = [],
        data_stream_renderers = [],
        dataReaders = [],
        layer,
    }) {
        this.data_frame_renderers = data_frame_renderers;
        this.dataFrameRenderersMap = new Map(
            data_frame_renderers.map(dfr => [dfr.dataframe, dfr])
        );
        this.data_stream_renderers = data_stream_renderers;
        this.dataStreamRenderersMap = new Map(
            data_stream_renderers.map(dsr => [dsr.data_stream, dsr])
        );
        this.rowRenderersMap = new Map();
        for(let i = 0; i < data_frame_renderers.length; i++) {
            data_frame_renderers[i].rowRenderers.forEach(
                rr => this.rowRenderersMap.set(rr.row, rr)
            );
        }
        //console.log(this.rowRenderersMap);
        this.animationTime = 0;
        this.lastRowReadTime = 0;
        //console.log("dataReaders.length = " + dataReaders.length);
        this.dataReaders = dataReaders;
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
        const timeDiff = frame.timeDiff / 1000;
        //const frameRate = frame.frameRate;

        this.animationTime += timeDiff;// / 1000;

        for(let i = 0; i < this.dataReaders.length; i++) {
            const dr = this.dataReaders[i];

            if(!dr.upstream.acceptsRows())
                continue;

            const readRows = dr.update(this.animationTime);

            if(readRows.length > 0) {
                const dfr = this.dataFrameRenderersMap.get(dr.sourceDF);
                dfr.updateRowRenderers(this.rowRenderersMap);
                dfr.updateLayout();
            }

            for(let j = 0; j < readRows.length; j++) {
                const rowRenderer = this.rowRenderersMap.get(readRows[j].row);
                const absPos = rowRenderer.shape.getAbsolutePosition();
                rowRenderer.shape.moveTo(this.layer);
                rowRenderer.shape.setAbsolutePosition(absPos);
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
            while((upstream != null) && (upstream instanceof DataStream)) {
                const dsr = this.dataStreamRenderersMap.has(upstream) ?
                    this.dataStreamRenderersMap.get(upstream) : null;
                
                if(dsr == null)
                    throw new Error("No matching stream renderer found");
                
                dsr.updateRows(this.animationTime);

                let next = upstream.upstream;
                if(next != null) {
                    const transferedRows = upstream
                        .pullTransfered(this.animationTime);
                    let transformedRows = transferedRows;
                    
                    while(next instanceof DataStreamTransformer) {
                        transformedRows = transformedRows
                            .map(r => r == null ? null : next.apply(r));
                            //.filter(r => r != null)
                        
                        next = next.upstream;
                    }

                    const appliedTransformations = next != upstream.upstream;

                    transformedRows.forEach((r, index) => {
                        if(r == null) {
                            const deletedRow = transferedRows[index].row;
                            dsr.removeRowRenderer(deletedRow);
                            this.rowRenderersMap.get(deletedRow).shape.destroy();
                            this.rowRenderersMap.delete(deletedRow);
                        }
                        else if(appliedTransformations) {
                            this.rowRenderersMap.get(transferedRows[index].row)
                                .redrawShape();
                        }
                    });

                    transformedRows = transformedRows.filter(r => r != null);
                    
                    if(transformedRows.length > 0) {
                        if(next instanceof DataFrame) {
                            const df = next;
                            const dfr = this.dataFrameRenderersMap.get(df);
                            transformedRows.forEach(r => {
                                df.rows.push(r.row);

                                dsr.removeRowRenderer(r.row);
                                dfr.updateRowRenderers(this.rowRenderersMap);
                                dfr.updateLayout();
                            });
                            //break;
                        }
                        else {
                            const usr = this.dataStreamRenderersMap
                                .get(next);
                            transformedRows.forEach(r => {
                                next.push(
                                    r.row, r.arrival_time + upstream.transfer_delay
                                );

                                dsr.removeRowRenderer(r.row);
                                usr.addRowRenderer(this.rowRenderersMap.get(r.row));
                            });
                        }
                    }
                }

                upstream = next;
            }
        }

        for(let i = 0; i < this.data_frame_renderers.length; i++) {
            this.data_frame_renderers[i].updateRows(timeDiff);
        }
    }

    createRowRenderer(row, x, y) {
        if(this.rowRenderersMap.has(row))
            throw new Error("A renderer already exists for " + row);

        const rowRenderer = new RowRenderer(row, x, y);
        this.rowRenderersMap.set(row, rowRenderer);
        this.layer.add(rowRenderer.shape);
        return rowRenderer;
    }

    static clearAll() {
        if (this.instance == null)
            return;

        this.instance.animation.stop();
        this.instance = null;
    }

    static fromDAG(dag, layer, verticalSpacing = 60) {
        this.clearAll();

        if(dag.operations.length == 0)
            return null;
        
        const reader = dag.getDataReader().copy(true);
        const sourceDF = reader.sourceDF;
        let writeToDF = dag.getWriteToDF().copy();
        let lastTransformer = dag.getLastTransformer();
        if(lastTransformer != null)
            lastTransformer = lastTransformer.copy();
    
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const columnsCount = 4;
        const padding = 5;
        const elementsOffset = 50;
        const width = padding * 2 + columnsCount * elementsOffset;
        const transformerBlockHeight = 60;
        const lastTransformerHeight = (lastTransformer == null) ?
            0 : (lastTransformer.dataFrameTransformers.length * transformerBlockHeight);
    
        const sourceDFRenderer = new DataFrameRenderer({
            dataframe: sourceDF,
            x: centerX - width / 2,
            y: centerY + ((lastTransformer == null) ?
                (verticalSpacing / 2) : (verticalSpacing + lastTransformerHeight / 2)),
            elements_offset: elementsOffset,
            max_height: 2,
            padding: padding,
            columnsDisplayCount: columnsCount,
        });
    
        const newDFRenderer = new DataFrameRenderer({
            dataframe: writeToDF,
            x: centerX - width / 2,
            y: centerY - ((lastTransformer == null) ?
                (verticalSpacing / 2) : (verticalSpacing + lastTransformerHeight / 2))
                - (padding * 2 + elementsOffset),
            elements_offset: elementsOffset,
            max_height: 2,
            padding: padding,
            columnsDisplayCount: columnsCount,
        });

        const streamRenderers = [];
    
        if(lastTransformer != null) {
            const transformerRenderer = new TransformerRenderer({
                transformer: lastTransformer,
                x: (window.innerWidth - 150) / 2,
                y: (window.innerHeight - lastTransformerHeight) / 2,
                width: 150,
                height: 60,
                snappable: false,
            });
    
            layer.add(transformerRenderer.staticShape);
        }
        else {
            const stream = new DataStream(
                reader,
                writeToDF,
                1 / 2,
            );
            reader.upstream = stream;

            streamRenderers.push(
                new DataStreamRenderer({
                    data_stream: stream,
                    start_x: sourceDFRenderer.topPoint().x,
                    start_y: sourceDFRenderer.topPoint().y,
                    end_x: newDFRenderer.bottomPoint().x,
                    end_y: newDFRenderer.bottomPoint().y,
                })
            );
        }
    
        layer.add(sourceDFRenderer.shape);
        layer.add(newDFRenderer.shape);

        return new StreamSimulator({
            data_frame_renderers: [sourceDFRenderer, newDFRenderer],
            data_stream_renderers: streamRenderers,
            dataReaders: [reader],
            layer,
        });
    }
}