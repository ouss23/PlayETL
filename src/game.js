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
import { FilterTransformer } from "./model/data_frame_transformers/filter_transformer.js";
import { DataStreamTransformer } from "./model/data_stream_transformer.js";
import { TransformerRenderer } from "./view/transformer_renderer.js";
import { UpdateTransformer } from "./model/data_frame_transformers/update_transformer.js";
import { Arrow } from "./view/shapes/arrow.js";
import { SnappableShape } from "./view/snappable_shape.js";

const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
});

const layer = new Konva.Layer();

const dataframe = new DataFrame(
    "source_df",
    RowRenderer.shapeSchema,
    [
        new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "B"], RowRenderer.shapeSchema),
        new Row(["star", "green", "C"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "D"], RowRenderer.shapeSchema),
        new Row(["diamond", "green", "E"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "F"], RowRenderer.shapeSchema),
        new Row(["star", "green", "G"], RowRenderer.shapeSchema),
        new Row(["diamond", "purple", "H"], RowRenderer.shapeSchema),
        new Row(["diamond", "green", "I"], RowRenderer.shapeSchema),
    ]
);
const dataframeRenderer = new DataFrameRenderer({
    dataframe: dataframe,
    x: 500,
    y: 400,
    elements_offset: 50,
    max_height: 2,
    padding: 5,
});

const dataframe2 = new DataFrame(
    "new_df",
    RowRenderer.shapeSchema,
    [
        //new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
    ]
);
const dataframeRenderer2 = new DataFrameRenderer({
    dataframe: dataframe2,
    x: 500,
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
const layer2 = new Konva.Layer();
stage.add(layer2);
l.draw();
//stage.add(bgLayer);
//bgLayer.draw()
layer.draw();
layer2.draw();

//console.log("main")

const stream = new DataStream(
    null,
    null,
    1/2,
);

const streamTransformer = new DataStreamTransformer(
    stream,
    null,
    [
        new FilterTransformer("shape", (v => v == "star")),
        //new FilterTransformer("color", (v => v == "green"))
        new UpdateTransformer("color", "orange")
    ]
)

const stream2 = new DataStream(
    stream,
    streamTransformer,
    2/2,
);

const stream3 = new DataStream(
    streamTransformer,
    dataframe2,
    2/2,
);
//df1 > reader > stream > stream2 > streamTransformer > stream3 > df2
stream.upstream = stream2;
streamTransformer.upstream = stream3;
streamTransformer.downstream = stream2;

const dfFirstRowPosition = dataframeRenderer.firstRowPosition();
const dfTopPoint = dataframeRenderer.topPoint();
const df2BottomPoint = dataframeRenderer2.bottomPoint();
const transformerPosition = {x: 500 + 105 - 75, y: 200};
const transformerCenter = {
    x: transformerPosition.x + 75,
    y: transformerPosition.y + 60 - 7,
};

const arrow1 = new Arrow({
    startX: dfTopPoint.x,
    startY: dfTopPoint.y - 15,
    endX: transformerCenter.x,
    endY: transformerCenter.y + 60 + 10,
    lineWidth: 30,
    pointerHeight: 15,
    pointerWidth: 40,
    fill: '#9ac3d9ff',
    //stroke: 'gray',
    //strokeWidth: 30
});
layer.add(arrow1.shape);

const arrow2 = new Arrow({
    startX: dfTopPoint.x,
    startY: transformerCenter.y - 60 - 10,
    endX: df2BottomPoint.x,
    endY: df2BottomPoint.y + 15,
    lineWidth: 30,
    pointerHeight: 15,
    pointerWidth: 40,
    fill: '#9ac3d9ff',
    //stroke: 'gray',
    //strokeWidth: 30
});
layer.add(arrow2.shape);

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
    end_x: transformerCenter.x,
    end_y: transformerCenter.y + 60 - 20,
});

const stream3Renderer = new DataStreamRenderer({
    data_stream: stream3,
    start_x: transformerCenter.x,
    start_y: transformerCenter.y - 60 + 20,
    end_x: df2BottomPoint.x,
    end_y: df2BottomPoint.y,
});

const transformerRenderer = new TransformerRenderer({
    transformer: streamTransformer,
    x: transformerPosition.x,
    y: transformerPosition.y,
    width: 150,
    height: 60,
    displayTexts: ["⚙️Filter", "⚙️Update"],
    displayContents: ["shape = star", "color = orange"]
});

layer2.add(
    transformerRenderer.snappableShape.shape
);
/*transformerRenderer.shape.moveToTop();
console.log("transformer Z : " + transformerRenderer.shape.zIndex());
transformerRenderer.shape.zIndex(50);
console.log("transformer Z : " + transformerRenderer.shape.zIndex());*/

const dataReader = new DataReader(
    dataframe,
    stream,
    1/2,
);

stream.downstream = dataReader;

const simulator = new StreamSimulator({
    data_frame_renderers: [dataframeRenderer, dataframeRenderer2],
    data_stream_renderers: [streamRenderer, stream2Renderer, stream3Renderer],
    dataReaders: [dataReader],
    layer: layer,
});

const anim = simulator.animation;

//anim.start();

document.addEventListener("keydown", (event) => {
    if (event.shiftKey) {
        console.log(event.key);
        if(anim.isRunning())
            anim.stop();
        else
            anim.start();
    }
});

const transformerRenderer2 = new TransformerRenderer({
    transformer: new DataStreamTransformer(
        null,
        null,
        [
            new FilterTransformer("shape", (v => v == "star")),
            //new FilterTransformer("color", (v => v == "green"))
            //new UpdateTransformer("color", "orange")
        ]
    ),
    x: 500,
    y: 200,
    width: 150,
    height: 60,
    displayTexts: ["⚙️Filter"],
    displayContents: ["shape = diamond"]
});

layer2.add(
    transformerRenderer2.snappableShape.shape
);