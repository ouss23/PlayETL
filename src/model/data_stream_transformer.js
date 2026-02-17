export class DataStreamTransformer {
    constructor(downstream, upstream, dataFrameTransformers) {
        this.downstream = downstream;
        this.upstream = upstream;
        this.dataFrameTransformers = dataFrameTransformers;
        this.rows = [];
    }

    apply(inputRow) {
        const newValue = this.dataFrameTransformers
            .reduce(
                (rowAcc, tr) =>
                    rowAcc == null ? null : tr.transformSingleRow(rowAcc),
                inputRow.row
            );
        return newValue == null ?
            null :
            {
                row: newValue,
                arrival_time: inputRow.arrival_time
            }
    }

    copy() {
        return new DataStreamTransformer(
            this.downstream,
            this.upstream,
            this.dataFrameTransformers
        );
    }
}