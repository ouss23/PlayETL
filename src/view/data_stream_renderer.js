//import { Row } from "../model/row.js";
//import { RowRenderer } from "./row_renderer.js";
import { DataStream } from "../model/data_stream.js";

export class DataStreamRenderer {
    constructor({
        data_stream,
        start_x = 0,
        start_y = 0,
        end_x = 0,
        end_y = 0,
    }) {
        this.data_stream = data_stream;
        this.start_x = start_x;
        this.start_y = start_y;
        this.end_x = end_x;
        this.end_y = end_y;
        this.rows_renderers = [];
    }

    lerp(x, y, a) { return x * (1 - a) + y * a; }

    addRowRenderer(row_renderer) {
        this.rows_renderers.push(row_renderer);
    }

    removeRowRenderer(row) {
        this.rows_renderers = this.rows_renderers
            .filter(rr => rr.row != row);
    }

    updateRows(current_time) {
        if(this.data_stream.rows.length != this.rows_renderers.length) {
            throw new Error("data_stream.rows.length = " +
                this.data_stream.rows.length +
                ", rows_renderers.length = " +
                this.rows_renderers.length
            );
        }
        for(let i = 0; i < this.data_stream.rows.length; i++) {
            if(this.data_stream.rows[i].row != this.rows_renderers[i].row)
                throw new Error("Stream Row and Renderer Row not matching " +
                    this.data_stream.rows[i].row);
            
            const abs_t = current_time - this.data_stream.rows[i].arrival_time;
            if(abs_t < 0) {
                this.rows_renderers[i].shape.x(this.start_x);
                this.rows_renderers[i].shape.y(this.start_y);
            }
            else if(abs_t > this.data_stream.transfer_delay) {
                this.rows_renderers[i].shape.x(this.end_x);
                this.rows_renderers[i].shape.y(this.end_y);
            }
            else {
                const norm_t = abs_t / this.data_stream.transfer_delay;
                this.rows_renderers[i].shape.x(
                    this.lerp(
                        this.start_x,
                        this.end_x,
                        norm_t
                    )
                );
                this.rows_renderers[i].shape.y(
                    this.lerp(
                        this.start_y,
                        this.end_y,
                        norm_t
                    )
                );
            }
        }
    }
}