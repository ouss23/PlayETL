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

const diamond = createDiamond({x: 50, y: 50, radius: 20, fill: '#e23b73ff', stroke: '#9e4160ff'});
const star = createStar({x: 150, y: 150, radius: 20, fill: '#3be2c6ff', stroke: '#4ca596ff'});

const text2 = new Konva.Text({
    x: 50-10,
    y: 50-9,
    text: '5',
    fontSize: 18,
    //fontFamily: 'Calibri',
    fill: 'white',
    align: 'center',
    width: 20,
    height: 100,
});

const text3 = new Konva.Text({
    x: 150-10,
    y: 150-9,
    text: 'A',
    fontSize: 18,
    //fontFamily: 'Calibri',
    fill: 'white',
    align: 'center',
    width: 20,
    height: 100,
});

//group.add(rect2);
group.add(rect);
group.add(text);

//layer.add(text);

//layer.add(createGridLayer(200, 200))
layer.add(group);
layer.add(diamond);
layer.add(star);
layer.add(text2);
layer.add(text3);
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
