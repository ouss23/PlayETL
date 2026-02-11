import { DataFrame } from "./data_frame.js";
import { DataReader } from "./data_reader.js";

export class OperationsDAG {
    constructor(operations = []) {
        this.operations = operations;
    }

    addUpstream(operation) {
        this.operations.push(operation);
    }

    addDownStream(operation) {
        this.operations.unshift(operation)
    }

    isValid() {
        return (this.operations.length == 0) || (
            (this.operations[0] instanceof DataReader) &&
            (this.operations[this.operations.length - 1].upstream instanceof DataFrame)
        )
    }
}