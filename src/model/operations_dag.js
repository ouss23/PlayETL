import { DataFrame } from "./data_frame.js";
import { DataReader } from "./data_reader.js";
import { DataStreamTransformer } from "./data_stream_transformer.js";

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

    getDataReader() {
        if(!(this.operations[0] instanceof DataReader))
            throw new Error("First DAG element must be a READ operation");

        return this.operations[0];
    }

    getLastTransformer() {
        if(this.operations.length == 1)
            return null;

        const lastTransformer = this.operations[
            this.operations.length - 1
        ];
        if(!(lastTransformer instanceof DataStreamTransformer))
            throw new Error("Last DAG element of size >1 must be " +
                "a DataStreamTransformer");
        
        return lastTransformer;
    }

    getWriteToDF() {
        if(this.operations.length == 1) {
            const reader = this.getDataReader();
            if(!(reader.upstream instanceof DataFrame))
                throw new Error("Last upstream must be a DataFrame");
    
            return reader.upstream;
        }
        else
            return this.getLastTransformer().upstream;
    }
}