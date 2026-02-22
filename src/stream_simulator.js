import { DataFrame } from "./model/data_frame.js";
import { DataReader } from "./model/data_reader.js";
import { DataStream } from "./model/data_stream.js";
import { DataStreamTransformer } from "./model/data_stream_transformer.js";
import { DataStreamRenderer } from "./view/data_stream_renderer.js";
import { RowRenderer } from "./view/row_renderer.js";
import { DataFrameRenderer } from "./view/data_frame_renderer.js";
import { TransformerRenderer } from "./view/transformer_renderer.js";
import { DataFrameContentTask } from "./model/level/data_frame_content_task.js";

export class SimulationState {
    static IDLE = new SimulationState(0);
    static IN_PROGRESS = new SimulationState(1);
    //static PAUSED = new SimulationState(2);
    static ENDED = new SimulationState(3);

    constructor(id) {
        this.id = id;
    }
}

export class StreamSimulator {
    constructor({
        data_frame_renderers = [],
        data_stream_renderers = [],
        dataReaders = [],
        layer,
        dag = null,
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
        this.state = SimulationState.IDLE;
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
        this.dag = dag;
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

        this.updateState();
    }

    createRowRenderer(row, x, y) {
        if(this.rowRenderersMap.has(row))
            throw new Error("A renderer already exists for " + row);

        const rowRenderer = new RowRenderer(row, x, y);
        this.rowRenderersMap.set(row, rowRenderer);
        this.layer.add(rowRenderer.shape);
        return rowRenderer;
    }

    updateState() {
        if((StreamSimulator.instance == null) || (this.animation == null))
        {
            this.state = SimulationState.IDLE;
            return;
        }

        if(this.animationTime <= 0)
        {
            this.state = SimulationState.IDLE;
            return;
        }

        let ended = true;
        for(let i = 0; i < this.dataReaders.length; i++) {
            if(this.dataReaders[i].sourceDF.rows.length > 0) {
                ended = false;
                break;
            }
            let upstream = this.dataReaders[i].upstream;
            while((upstream != null) && (upstream instanceof DataStream)) {
                if(upstream.rows.length > 0) {
                    ended = false;
                    break;
                }

                let next = upstream.upstream;
                if(next != null) {
                    while(next instanceof DataStreamTransformer) {
                        //TODO : check buffer size
                        next = next.upstream;
                    }
                }

                upstream = next;
            }
        }

        if(ended && (this.state != SimulationState.ENDED))
        {
            this.state = SimulationState.ENDED
            this.onSimulationEnded();
        }
        else
            this.state = ended ? SimulationState.ENDED : SimulationState.IN_PROGRESS;
    }

    static refreshLevelTasksUI() {
        if(this.instance == null) {
            document.getElementById("level-tasks-title").innerHTML = "Level tasks (-/-)";
            document.getElementById("level-tasks-content").innerHTML = "";
            return;
        }

        const levelTask = new DataFrameContentTask(
            rows => rows.filter(r => r.getCellValue("shape") == "star")
                .map(r => r.setCellValue("color", "orange")),
                "Keep Stars only and turn their color to Orange"
        );
        const validation = levelTask.checkValidation(
            this.instance.state == SimulationState.ENDED,
            this.instance.dag.getDataReader().sourceDF,
            Array.from(this.instance.dataFrameRenderersMap.keys())
                .find(df => df.name == this.instance.dag.getWriteToDF().name),
            this.instance.dag,
        );

        document.getElementById("level-tasks-title").innerHTML = "Level tasks (" +
            (validation ? "1" : "0") + "/1)";
        document.getElementById("level-tasks-content").innerHTML =
            (validation ? "🟢" : "⚪") + " " + levelTask.description;
    }

    onSimulationEnded() {
        StreamSimulator.refreshLevelTasksUI();
        //console.log("Simulation ended : " + validation);
    }

    static clearAll() {
        if (this.instance == null)
            return;

        this.instance.animation.stop();
        this.instance = null;
    }

    static fromDAG(dag, baseLayer, transformersLayer, verticalSpacing = 60) {
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
        const stream1 = new DataStream(
            reader,
            null,
            1 / 2,
        );
        reader.upstream = stream1;

        streamRenderers.push(
            new DataStreamRenderer({
                data_stream: stream1,
                start_x: sourceDFRenderer.firstRowPosition().x,
                start_y: sourceDFRenderer.firstRowPosition().y,
                end_x: sourceDFRenderer.topPoint().x,
                end_y: sourceDFRenderer.topPoint().y,
            })
        );
    
        if(lastTransformer != null) {
            const transformerRenderer = new TransformerRenderer({
                transformer: lastTransformer,
                x: (window.innerWidth - 150) / 2,
                y: (window.innerHeight - lastTransformerHeight) / 2,
                width: 150,
                height: 60,
                snappable: false,
            });
    
            transformersLayer.add(transformerRenderer.staticShape);

            const transformerDownstreamPoint = {
                x: transformerRenderer.x + transformerRenderer.width / 2,
                y: transformerRenderer.y - TransformerRenderer.plugHeight +
                    lastTransformer.dataFrameTransformers.length *
                        transformerBlockHeight - 20,
            };
            const transformerUpstreamPoint = {
                x: transformerDownstreamPoint.x,
                y: transformerRenderer.y - TransformerRenderer.plugHeight + 20,
            };

            const stream2 = new DataStream(
                stream1,
                lastTransformer,
                1 / 2,
            );
            stream1.upstream = stream2;
            lastTransformer.downstream = stream2;

            const stream3 = new DataStream(
                lastTransformer,
                writeToDF,
                1 / 2,
            );
            lastTransformer.upstream = stream3;

            streamRenderers.push(
                new DataStreamRenderer({
                    data_stream: stream2,
                    start_x: sourceDFRenderer.topPoint().x,
                    start_y: sourceDFRenderer.topPoint().y,
                    end_x: transformerDownstreamPoint.x,
                    end_y: transformerDownstreamPoint.y,
                })
            );
            streamRenderers.push(
                new DataStreamRenderer({
                    data_stream: stream3,
                    start_x: transformerUpstreamPoint.x,
                    start_y: transformerUpstreamPoint.y,
                    end_x: newDFRenderer.bottomPoint().x,
                    end_y: newDFRenderer.bottomPoint().y,
                })
            );
        }
        else {
            const stream2 = new DataStream(
                stream1,
                writeToDF,
                1 / 2,
            );
            stream1.upstream = stream2;

            streamRenderers.push(
                new DataStreamRenderer({
                    data_stream: stream2,
                    start_x: sourceDFRenderer.topPoint().x,
                    start_y: sourceDFRenderer.topPoint().y,
                    end_x: newDFRenderer.bottomPoint().x,
                    end_y: newDFRenderer.bottomPoint().y,
                })
            );
        }
    
        baseLayer.add(sourceDFRenderer.shape);
        baseLayer.add(newDFRenderer.shape);

        return new StreamSimulator({
            data_frame_renderers: [sourceDFRenderer, newDFRenderer],
            data_stream_renderers: streamRenderers,
            dataReaders: [reader],
            layer: baseLayer,
            dag: dag,
        });
    }
}