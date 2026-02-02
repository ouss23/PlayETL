import { NarrowTransformer } from "./narrow_transformer.js";

export class UpdateTransformer extends NarrowTransformer {
    constructor(columnName, value) {
        super();
        this.columnName = columnName;
        this.value = value;
    }

    transformSingleRow(row, deepCopy = false) {
        const ret = deepCopy ? row.copy() : row;
        ret.values[
            ret.schema.columns.findIndex(c => c.name == this.columnName)
        ] = this.value;
        return ret;
    }
}