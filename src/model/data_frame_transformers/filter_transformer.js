import { NarrowTransformer } from "./narrow_transformer.js";

export class FilterTransformer extends NarrowTransformer {
    constructor(columnName, condition) {
        super();
        this.columnName = columnName;
        this.condition = condition;
    }

    transformSingleRow(row, deepCopy = false) {
        return this.condition(
            row.values[row.schema.columns.findIndex(c => c.name == this.columnName)]
        ) ? (deepCopy ? row.copy() : row) : null;
    }
}