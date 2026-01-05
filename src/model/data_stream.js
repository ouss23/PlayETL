import { Schema } from "./schema.js";
import { Row } from "./row.js";

export class DataStream {
    constructor(downstream, upstream, transfer_delay) {
        //this.name = name;
        this.downstream = downstream;
        this.upstream = upstream;
        this.transfer_delay = transfer_delay;
        this.rows = [];
    }

    push(row, arrival_time) {
        this.rows.push({
            row: row,
            arrival_time: arrival_time,
        });
    }

    pullTransfered(current_time) {
        const ret = this.rows.filter(
            row => current_time >= row.arrival_time + this.transfer_delay
        );
        if(ret.length > 0)
        {
            this.rows = this.rows.filter(
                row => current_time < row.arrival_time + this.transfer_delay
            );
        }
        
        return ret;
    }
}