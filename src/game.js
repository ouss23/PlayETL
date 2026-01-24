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

layer.add(
    dataframeRenderer.shape
);
//console.log(dataframe);

/*const star = new RowRenderer(
    new Row(["star", "purple", "X"], RowRenderer.shapeSchema),
    50,
    50,
).shape;
layer.add(star);*/

/*const bgLayer = new Konva.Layer();
bgLayer.add(new Konva.Line({
    points: [0, 200, 1000, 200],
    stroke: "black",
    strokeWidth: 2
}));*/
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
    5/2,
);

const stream2 = new DataStream(
    stream,
    null,
    5/2,
);

stream.upstream = stream2;

const streamRenderer = new DataStreamRenderer({
    data_stream: stream,
    start_x: 100,
    start_y: 100,
    end_x: 500,
    end_y: 300,
});

const stream2Renderer = new DataStreamRenderer({
    data_stream: stream2,
    start_x: 500,
    start_y: 300,
    end_x: 1000,
    end_y: 300,
});

const dataReader = new DataReader(
    dataframe,
    stream,
    1/2,
);

stream.downstream = dataReader;

let animationTime = 0;
let lastRowReadTime = 0;
let rowReadDelay = 1/2;
const lerp = (x, y, a) => x * (1 - a) + y * a;

const simulator = new StreamSimulator({
    data_frame_renderers: [dataframeRenderer],
    data_stream_renderers: [streamRenderer, stream2Renderer],
    dataReaders: [dataReader],
    layer: layer,
});

const anim = simulator.animation;

/*const anim = new Konva.Animation(
    function(frame) {
        const time = frame.time;
        const timeDiff = frame.timeDiff;
        //const frameRate = frame.frameRate;

        animationTime += timeDiff / 1000;

        if(animationTime > lastRowReadTime + rowReadDelay) {
            if(dataframe.rows.length > 0) {
                const row = dataframe.rows.shift();
                stream.push(row, lastRowReadTime + rowReadDelay);
                const rowRenderer = new RowRenderer(row, 100, 100);
                layer.add(rowRenderer.shape);
                streamRenderer.addRowRenderer(rowRenderer);

                lastRowReadTime += rowReadDelay;
            }
        }

        streamRenderer.updateRows(animationTime);
    },
    layer
);*/

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