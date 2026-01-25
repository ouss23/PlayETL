//import { DataFrame } from "./model/data_frame.js";
import { createDiamond } from "./view/shapes/diamond.js";
import { createStar } from "./view/shapes/star.js";
import { createGridLayer } from "./view/background.js"
import { Row } from "./model/row.js";
import { RowRenderer } from "./view/row_renderer.js";
import { DataFrameRenderer } from "./view/data_frame_renderer.js";
import { DataFrame } from "./model/data_frame.js";
import { DataStream } from "./model/data_stream.js";
import { DataStreamRenderer } from "./view/data_stream_renderer.js";
import { StreamSimulator } from "./stream_simulator.js";
import { DataReader } from "./model/data_reader.js";

const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
});

const layer = new Konva.Layer();
//stage.add(layer);

const group = new Konva.Group({
    x: 50,
    y: 50,
    draggable: true,
});

const rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: 150,
    height: 70,
    fill: '#919191ff',
    //draggable: true,
    cornerRadius: 2,
    stroke: '#555',
    strokeWidth: 2,
    lineCap: 'round',
});

const rect2 = new Konva.Rect({
    x: 0,
    y: 20,
    width: 150,
    height: 74,
    fill: '#737373ff',
    //draggable: true,
    //cornerRadius: 10,
    stroke: '#555',
    strokeWidth: 2,
});

const text = new Konva.Text({
    x: 0,
    y: 25,
    text: '⚠️ Dataframe ⚠️',
    fontSize: 20,
    fontFamily: 'Avenir',
    fill: '#555',
    align: 'center',
    width: 150,
    height: 100,
});

//group.add(rect2);
group.add(rect);
group.add(text);

//layer.add(text);

/*const star = new RowRenderer(
    new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
    50,
    50,
).shape;

const diamond = new RowRenderer(
    new Row(["diamond", "purple", "A"], RowRenderer.shapeSchema),
    250,
    150,
).shape;*/

//layer.add(createGridLayer(200, 200))
layer.add(group);
/*layer.add(diamond);
layer.add(star);*/

//const row = new Row(["star", "white", "S"], RowRenderer.shapeSchema);
const dataframe = new DataFrame(
    "sample_df",
    RowRenderer.shapeSchema,
    [
        new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "A"], RowRenderer.shapeSchema),
        new Row(["star", "green", "S"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "B"], RowRenderer.shapeSchema),
        new Row(["diamond", "green", "C"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "A"], RowRenderer.shapeSchema),
        new Row(["star", "green", "S"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "B"], RowRenderer.shapeSchema),
        new Row(["diamond", "green", "C"], RowRenderer.shapeSchema),
    ]
);
const dataframeRenderer = new DataFrameRenderer({
    dataframe: dataframe,
    x: 500,
    y: 300,
    elements_offset: 50,
    max_height: 2,
    padding: 5,
});

const dataframe2 = new DataFrame(
    "target_df",
    RowRenderer.shapeSchema,
    [
        //new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
    ]
);
const dataframeRenderer2 = new DataFrameRenderer({
    dataframe: dataframe2,
    x: 600,
    y: 50,
    elements_offset: 50,
    max_height: 2,
    padding: 5,
});

layer.add(
    dataframeRenderer.shape
);
layer.add(
    dataframeRenderer2.shape
);

const l = createGridLayer({width:1500, height:1500, cellSize:50});
stage.add(l)
stage.add(layer);
l.draw();
//stage.add(bgLayer);
//bgLayer.draw()
layer.draw();

//console.log("main")

const stream = new DataStream(
    null,
    null,
    1/2,
);

const stream2 = new DataStream(
    stream,
    dataframe2,
    5/2,
);

stream.upstream = stream2;

const dfFirstRowPosition = dataframeRenderer.firstRowPosition();
const dfTopPoint = dataframeRenderer.topPoint();
const df2BottomPoint = dataframeRenderer2.bottomPoint();

const streamRenderer = new DataStreamRenderer({
    data_stream: stream,
    start_x: dfFirstRowPosition.x,
    start_y: dfFirstRowPosition.y,
    end_x: dfTopPoint.x,
    end_y: dfTopPoint.y,
});

const stream2Renderer = new DataStreamRenderer({
    data_stream: stream2,
    start_x: dfTopPoint.x,
    start_y: dfTopPoint.y,
    end_x: df2BottomPoint.x,
    end_y: df2BottomPoint.y,
});

const dataReader = new DataReader(
    dataframe,
    stream,
    1/2,
);

stream.downstream = dataReader;

const simulator = new StreamSimulator({
    data_frame_renderers: [dataframeRenderer, dataframeRenderer2],
    data_stream_renderers: [streamRenderer, stream2Renderer],
    dataReaders: [dataReader],
    layer: layer,
});

const anim = simulator.animation;

anim.start();

document.addEventListener("keydown", (event) => {
    if (event.shiftKey) {
        console.log(event.key);
        if(anim.isRunning())
            anim.stop();
        else
            anim.start();
    }
});