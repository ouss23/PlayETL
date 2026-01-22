export class DataReader {
    constructor(sourceDF, upstream, rowReadDelay) {
        this.sourceDF = sourceDF;
        this.upstream = upstream;
        this.rowReadDelay = rowReadDelay;
        this.lastRowReadTime = 0;
    }

    update(currentTime) {
        const readRows = [];
        /*while*/if(currentTime > this.lastRowReadTime + this.rowReadDelay) {
            if(this.sourceDF.rows.length > 0) {
                const row = this.sourceDF.rows.shift();
                this.upstream.push(row, this.lastRowReadTime + this.rowReadDelay);
                /*const rowRenderer = new RowRenderer(row, 100, 100);
                layer.add(rowRenderer.shape);
                streamRenderer.addRowRenderer(rowRenderer);*/

                this.lastRowReadTime += this.rowReadDelay;

                readRows.push({
                    row: row,
                    arrival_time: this.lastRowReadTime,
                });
            }
        }

        return readRows;
    }
}