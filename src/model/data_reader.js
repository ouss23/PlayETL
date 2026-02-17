export class DataReader {
    constructor(sourceDF, upstream, rowReadDelay) {
        this.sourceDF = sourceDF;
        this.upstream = upstream;
        this.rowReadDelay = rowReadDelay;
        this.lastRowReadTime = 0;
    }

    update(currentTime) {
        const readRows = [];
        while((this.sourceDF.rows.length > 0) &&
            (currentTime > this.lastRowReadTime + this.rowReadDelay)) {
            const row = this.sourceDF.rows.shift();
            this.upstream.push(row, this.lastRowReadTime + this.rowReadDelay);

            this.lastRowReadTime += this.rowReadDelay;

            readRows.push({
                row: row,
                arrival_time: this.lastRowReadTime,
            });
        }

        return readRows;
    }

    copy(deepSourceDFCopy = true) {
        return new DataReader(
            deepSourceDFCopy ? this.sourceDF.copy() : this.sourceDF,
            this.upstream,
            this.rowReadDelay
        );
    }
}