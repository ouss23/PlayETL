import { createDiamond } from "./shapes/diamond.js";
import { createStar } from "./shapes/star.js";
import { Row } from "../model/row.js";
import { Schema } from "../model/schema.js";
import { Column } from "../model/column.js";
import { ShapeColor } from "./shapes/shape_colors.js";

export class RowRenderer {
    static shapeSchema = new Schema(
        [
            new Column("shape", "string"),
            new Column("color", "string"),
            new Column("label", "string"),
        ]
    );

    constructor(row, x, y) {
        if(row.schema != RowRenderer.shapeSchema)
            throw new Error("Given row doesn't have a shape schema");

        if(!ShapeColor.defaultColors.has(row.values[1]))
            throw new Error("Invalid shape color " + row.values[1]);

        this.row = row;
        this.shape = new Konva.Group({
            x: x,
            y: y,
            draggable: false,
        });

        this.redrawShape();
    }

    //call this to redraw this.shape after this.row values were changed
    redrawShape() {
        this.shape.destroyChildren();
        const shapeColor = ShapeColor.defaultColors.get(this.row.values[1]);
        switch(this.row.values[0]) {
            case "star":
                this.shape.add(createStar({
                    x: 0,
                    y: 0,
                    fill: shapeColor.fill,
                    stroke: shapeColor.stroke,
                    radius: 20,
                }));
                break;
            case "diamond":
                this.shape.add(createDiamond({
                    x: 0,
                    y: 0,
                    fill: shapeColor.fill,
                    stroke: shapeColor.stroke,
                    radius: 20,
                }));
                break;
            default:
                throw new Error("Shape must either be 'star' or 'diamond'");
        }

        this.shape.add(new Konva.Text({
            x: -10,
            y: -9,
            text: this.row.values[2] == null ? "-" : this.row.values[2],
            fontSize: 18,
            //fontFamily: 'Calibri',
            fill: 'white',
            align: 'center',
            width: 20,
            height: 30,
        }));
    }
}