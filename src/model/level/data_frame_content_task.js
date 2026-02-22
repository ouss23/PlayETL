import { LevelTask } from "./level_task.js";

export class DataFrameContentTask extends LevelTask {
    constructor(rowsTransformer, description) {
        const validator = (simulationEnded, sourceDF, newDF, operationsDAG) => {
            if(!simulationEnded)
                return false;

            let transformedRows = rowsTransformer(sourceDF.rows.map(r => r.copy()));
            if(transformedRows.length != newDF.rows.length)
                return false;

            for(let i = 0; i < newDF.rows.length; i++) {
                const otherIndex = transformedRows
                    .findIndex(v => v.valuesEqual(newDF.rows[i]));
                if(otherIndex >= 0)
                {
                    transformedRows = transformedRows
                        .filter((v, j) => j != otherIndex);
                }
                else
                    return false;
            }

            return true;
        }
        super(validator, description);
        this.rowsTransformer = rowsTransformer;
    }

    checkValidation(simulationEnded, sourceDF, newDF, operationsDAG) {
        return this.validator(simulationEnded, sourceDF, newDF, operationsDAG);
    }
}