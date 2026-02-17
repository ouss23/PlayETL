import { NarrowTransformer } from "./narrow_transformer.js";

export class FilterTransformer extends NarrowTransformer {
    constructor(columnName, value/*, condition*/) {
        super();
        this.columnName = columnName;
        //this.condition = condition;
        this.value = value;
    }

    transformSingleRow(row, deepCopy = false) {
        return (
            this.value ==
            row.values[row.schema.columns.findIndex(c => c.name == this.columnName)]
        ) ? (deepCopy ? row.copy() : row) : null;

        /*return this.condition(
            row.values[row.schema.columns.findIndex(c => c.name == this.columnName)]
        ) ? (deepCopy ? row.copy() : row) : null;*/
    }
}