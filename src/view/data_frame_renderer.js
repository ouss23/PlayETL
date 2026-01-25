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
        columnsDisplayCount = 4,
        rowAnimationDamp = 6,
    }) {
        this.dataframe = dataframe;
        this.x = x;
        this.y = y;
        this.elements_offset = elements_offset;
        this.padding = padding;
        this.max_width = max_width;
        this.max_height = max_height;
        this.rowAnimationDamp = rowAnimationDamp;

        if((max_width != null) && (max_height != null))
            throw new Error("DataFrameRenderer must not have limits both on " +
                "width and height");
        
        /*const width = (max_width == null) ?
            ((max_height == null) ?
                Math.ceil(Math.sqrt(dataframe.rows.length)) :
                Math.ceil(dataframe.rows.length / max_height)) :
            Math.min(max_width, dataframe.rows.length);*/

        const width = columnsDisplayCount;
        const height = Math.max(1, Math.ceil(dataframe.rows.length / width));
        this.width = width;
        this.height = height;

        this.shape = new Konva.Group({
            x: x,
            y: y,
            //draggable: true,
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

        this.rowRenderers = [];
        for(let i = 0; i < dataframe.rows.length; i++)
        {
            const rowRenderer = new RowRenderer(
                dataframe.rows[i],
                padding + ((i % width) + 1 / 2) * elements_offset,
                padding + (Math.floor(i / width) + 1 / 2) * elements_offset,
            );
            this.rowRenderers.push(rowRenderer);
            this.shape.add(
                rowRenderer.shape
            );
        }
    }

    topPoint() {
        return {
            x: this.shape.x() + (this.width * this.elements_offset / 2) + this.padding,
            y: this.shape.y()
        }
    }

    bottomPoint() {
        return {
            x: this.shape.x() + (this.width * this.elements_offset / 2) + this.padding,
            y: this.shape.y() + this.height * this.elements_offset + 2 * this.padding
        }
    }

    firstRowPosition() {
        return {
            x: this.shape.x() + this.padding + this.elements_offset / 2,
            y: this.shape.y() + this.padding + this.elements_offset / 2
        }
    }

    lerp(x, y, a) { return x * (1 - a) + y * a; }

    updateRowRenderers(allRowRenderersMap) {
        this.rowRenderers = this.dataframe.rows
            .map(row => allRowRenderersMap.get(row));

        //console.log(this.rowRenderers);
        //console.log(allRowRenderersMap);
        
        this.rowRenderers.forEach(
            rr => {
                const absPos = rr.shape.getAbsolutePosition();
                rr.shape.moveTo(this.shape);
                rr.shape.setAbsolutePosition(absPos);
            }
        );
    }

    updateRows(deltaTime) {
        for(let i = 0; i < this.rowRenderers.length; i++) {
            const shape = this.rowRenderers[i].shape;
            shape.x(this.lerp(
                shape.x(),
                this.padding + ((i % this.width) + 1 / 2) * this.elements_offset,
                deltaTime * this.rowAnimationDamp,
            ));
            shape.y(this.lerp(
                shape.y(),
                this.padding + (Math.floor(i / this.width) + 1 / 2) * this.elements_offset,
                deltaTime * this.rowAnimationDamp,
            ));
        }
    }
}