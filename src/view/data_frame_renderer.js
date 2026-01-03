import { Row } from "../model/row.js";
import { RowRenderer } from "./row_renderer.js";

export class DataFrameRenderer {
    constructor({
        dataframe,
        x = 0,
        y = 0,
        elements_offset = 30,
        padding = 10,
        max_width = null,
        max_height = null,
    }) {
        this.dataframe = dataframe;
        this.x = x;
        this.y = y;
        this.elements_offset = elements_offset;
        this.max_width = max_width;
        this.max_height = max_height;

        if((max_width != null) && (max_height != null))
            throw new Error("DataFrameRenderer must not have limits both on " +
                "width and height");
        
        const width = (max_width == null) ?
            ((max_height == null) ?
                Math.ceil(Math.sqrt(dataframe.rows.length)) :
                Math.ceil(dataframe.rows.length / max_height)) :
            Math.min(max_width, dataframe.rows.length);
        const height = Math.ceil(dataframe.rows.length / width);

        this.shape = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
        });

        this.shape.add(
            new Konva.Rect({
                x: 0,
                y: 0,
                width: padding * 2 + width * elements_offset,
                height: padding * 2 + height * elements_offset,
                //fill: '#ffffff16',
                //draggable: true,
                cornerRadius: 2,
                stroke: '#1b96cfff',
                strokeWidth: 2,
                lineCap: 'round',
                dash: [10, 10],
            })
        );

        for(let i = 0; i < dataframe.rows.length; i++)
        {
            this.shape.add(
                new RowRenderer(
                    dataframe.rows[i],
                    padding + ((i % width) + 1 / 2) * elements_offset,
                    padding + (Math.floor(i / width) + 1 / 2) * elements_offset,
                ).shape
            )
        }
    }
}