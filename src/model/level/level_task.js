export class LevelTask {
    constructor(validator, description) {
        this.validator = validator;
        this.description = description;
    }

    checkValidation(simulationEnded, sourceDF, newDF, operationsDAG) {
        return this.validator(simulationEnded, sourceDF, newDF, operationsDAG);
    }
}