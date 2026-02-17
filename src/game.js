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
import { ShapeColor } from "./view/shapes/shape_colors.js";
import { DataIORenderer, IOOperationType } from "./view/data_io_renderer.js";
import { Menu, MenusManager } from "./view/menus_manager.js";

var operationTypeSelect = document.getElementById("op-type");
operationTypeSelect.options.length = 0;
[
    new Option('Read', 'read'),
    new Option('Write', 'write'),
    new Option('Filter', 'filter'),
    new Option('Update', 'update'),
].forEach((v, i) => {
    operationTypeSelect.options[i] = v;
});

var operationColumnSelect = document.getElementById("op-column");
operationColumnSelect.options.length = 0;
RowRenderer.shapeSchema.columns.forEach((v, i) => {
    operationColumnSelect.options[i] = new Option(v.name, v.name);
});

operationColumnSelect.addEventListener("change", (event) => {
    updateOperationValueOptions();
});

function updateOperationValueOptions() {
    const value = operationColumnSelect
        .options[operationColumnSelect.selectedIndex].value;
    let options = [];
    switch(value) {
        case "shape":
            options = ["star", "diamond"];
            break;
        case "color":
            options = ShapeColor.defaultColors.keys();
            break;
        case "label":
            options = ["A", "B", "C", "D", "E", "F", "G", "H"];
            break;
        default:
            throw new Error("unexpected operation column " + value);
    }
    var operationColumnValue = document.getElementById("op-value");
    operationColumnValue.options.length = 0;
    options.forEach((v, i) => {
        operationColumnValue.options[i] = new Option(v, v);
    });
}

updateOperationValueOptions();

operationColumnSelect.options.length = 0;
RowRenderer.shapeSchema.columns.forEach((v, i) => {
    operationColumnSelect.options[i] = new Option(v.name, v.name);
});

const stage = new Konva.Stage({
    container: 'konva-edit-container',
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
/*const dataframeRenderer = new DataFrameRenderer({
    dataframe: dataframe,
    x: 500,
    y: 400,
    elements_offset: 50,
    max_height: 2,
    padding: 5,
});*/

const dataframe2 = new DataFrame(
    "new_df",
    RowRenderer.shapeSchema,
    [
        //new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
    ]
);
/*const dataframeRenderer2 = new DataFrameRenderer({
    dataframe: dataframe2,
    x: 500,
    y: 50,
    elements_offset: 50,
    max_height: 2,
    padding: 5,
});*/

/*layer.add(
    dataframeRenderer.shape
);
layer.add(
    dataframeRenderer2.shape
);*/

const l = createGridLayer({width:1500, height:1500, cellSize:40});
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

/*const stream = new DataStream(
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

const dataReader = new DataReader(
    dataframe,
    stream,
    1/2,
);

stream.downstream = dataReader;*/

/*const simulator = new StreamSimulator({
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
});*/

const sourceDF = dataframe;//new DataFrame("source_df", RowRenderer.shapeSchema);
const newDF = new DataFrame("new_df", RowRenderer.shapeSchema);

var operationAddButton = document.getElementById("op-add");
operationAddButton.addEventListener("click", event => {
    const opType = operationTypeSelect
        .options[operationTypeSelect.selectedIndex].value;
    const opColumn = operationColumnSelect
        .options[operationColumnSelect.selectedIndex].value;
    var operationValueSelect = document.getElementById("op-value");
    const opValue = operationValueSelect
        .options[operationValueSelect.selectedIndex].value;
    
    let newRenderer = null;
    if((opType == "read") || (opType == "write")) {
        newRenderer = new DataIORenderer({
            dataFrame: opType == "read" ? sourceDF : newDF,
            operationType: opType == "read" ?
                IOOperationType.READ : IOOperationType.WRITE,
            x: (window.innerWidth - 150) / 2,
            y: (window.innerHeight - 60) / 2,
            width: 150,
            height: 60,
            displayText: opType == "read" ? "📤​Read" : "📥​​Write",
            displayContent: opType == "read" ? "source_df" : "new_df",
        });
    }
    else {
        newRenderer = new TransformerRenderer({
            transformer: new DataStreamTransformer(
                null,
                null,
                [
                    opType == "filter" ?
                        new FilterTransformer(opColumn, opValue/*(v => v == opValue)*/) :
                        new UpdateTransformer(opColumn, opValue),
                ]
            ),
            x: (window.innerWidth - 150) / 2,
            y: (window.innerHeight - 60) / 2,
            width: 150,
            height: 60,
            //displayTexts: [opType == "filter" ? "🔍Filter" : "✏️​Update"],
            //displayContents: [opColumn + " = " + opValue]
        });
    }

    layer2.add(
        newRenderer.snappableShape.shape
    );
});

var validateButton = document.getElementById("status-validate");
validateButton.addEventListener("click", event => {
    const jobValidation = SnappableShape.buildConnections();
    document.getElementById('status-div').innerHTML = 'Job status : ' +
        (jobValidation.status == "success" ? "🟢" : "🔴​");
    if(jobValidation.status != "success")
        console.log("Job validation failed : " + jobValidation.reason);
    else {
        const dags = SnappableShape.buildDAGs();
        document.getElementById('dags-count').innerHTML = 'DAGs count : ' +
            dags.length;
        console.log(dags);
    }
});

const simulationStage = new Konva.Stage({
    container: 'konva-simulation-container',
    width: window.innerWidth,
    height: window.innerHeight,
});
const simulationGridLayer = createGridLayer({width:1500, height:1500, cellSize:40});
const simulationLayer = new Konva.Layer();
simulationStage.add(simulationGridLayer);
simulationStage.add(simulationLayer);
simulationGridLayer.draw();
simulationLayer.draw();

MenusManager.init(stage, simulationStage);

function drawDAG(dag, layer, verticalSpacing = 60) {
    if(dag.operations.length == 0)
        return;

    const reader = dag.getDataReader();
    let writeToDF = dag.getWriteToDF();
    let lastTransformer = dag.getLastTransformer();

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
        dataframe: reader.sourceDF,
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

    layer.add(sourceDFRenderer.shape);
    layer.add(newDFRenderer.shape);
}

var toSimulationButton = document.getElementById("simulation-view");
toSimulationButton.addEventListener("click", event => {
    MenusManager.setMenu(Menu.Simulation);
    simulationLayer.destroyChildren();
    const jobValidation = SnappableShape.buildConnections();
    if(jobValidation.status != "success")
        console.log("DAG rendering skipped because job validation failed");
    else {
        const dags = SnappableShape.buildDAGs();
        if(dags.length == 0)
            console.log("No dag to render");
        else
            drawDAG(dags[0], simulationLayer);
    }
});

//test only
var toEditButton = document.getElementById("simulation-restart");
toEditButton.addEventListener("click", event => {
    MenusManager.setMenu(Menu.Edit);
});