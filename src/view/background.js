function createGridLayer({
  width,
  height,
  cellSize = 10,
  color = '#a7cde870'
}) {
    const _layer = new Konva.Layer();

    for (let x = 0; x <= width; x += cellSize) {
        _layer.add(new Konva.Line({
            points: [x, 0, x, height],
            stroke: color,
            strokeWidth: (x % (cellSize * 4)) == 0 ? 2 : 1
        }));
    }

    for (let y = 0; y <= height; y += cellSize) {
        _layer.add(new Konva.Line({
            points: [0, y, width, y],
            stroke: color,
            strokeWidth: (y % (cellSize * 4)) == 0 ? 2 : 1
        }));
    }

    //console.log("draw BG")

    return _layer;
}
