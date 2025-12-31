//import { DataFrame } from "./model/data_frame.js";
import { createDiamond } from "./view/shapes/diamond.js";
import { createStar } from "./view/shapes/star.js";
import { createGridLayer } from "./view/background.js"
import { Row } from "./model/row.js";
import { RowRenderer } from "./view/row_renderer.js";

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
    //fontFamily: 'Calibri',
    fill: '#555',
    align: 'center',
    width: 150,
    height: 100,
});

//group.add(rect2);
group.add(rect);
group.add(text);

//layer.add(text);

const star = new RowRenderer(
    new Row(["star", "purple", "A"], RowRenderer.shapeSchema),
    50,
    50,
).shape;

const diamond = new RowRenderer(
    new Row(["diamond", "purple", "A"], RowRenderer.shapeSchema),
    250,
    150,
).shape;

//layer.add(createGridLayer(200, 200))
layer.add(group);
layer.add(diamond);
layer.add(star);

const row = new Row(["star", "white", "S"], RowRenderer.shapeSchema);
console.log(row);

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
