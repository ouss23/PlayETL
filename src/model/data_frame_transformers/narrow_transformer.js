import { DataFrameTransformer } from "./data_frame_transformer.js";

export class NarrowTransformer extends DataFrameTransformer {
    transformRows(rows, deepCopy = false) {
        return rows
            .map(r => this.transformSingleRow(r, deepCopy))
            .filter(r => r != null);
    }

    transformSingleRow(row, deepCopy = false) {
        return deepCopy ? row.copy() : row;
    }
}