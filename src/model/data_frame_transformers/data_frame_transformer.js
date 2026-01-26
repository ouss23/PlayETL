import { DataFrame } from "../data_frame.js";

export class DataFrameTransformer {
    /*constructor() {
        //this.name = name;
    }*/

    transformDataFrame(dataFrame, deepCopy = false) {
        const schema = this.transformSchema(dataFrame.schema);
        const rows = this.transformRows(dataFrame.rows, deepCopy);
        if(!deepCopy && (schema == dataFrame.schema) && (rows == dataFrame.rows))
            return dataFrame;
        else
            return new DataFrame(dataFrame.name, schema, rows);
    }

    transformSchema(schema) {
        return schema;
    }

    transformRows(rows, deepCopy) {
        return deepCopy ? rows.map(r => r.copy()) : rows;
    }
}