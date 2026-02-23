import { SimulationState } from "../../stream_simulator.js";

export class GameLevel {
    constructor(sourceDF, description, levelTasks) {
        this.sourceDF = sourceDF;
        this.description = description;
        this.levelTasks = levelTasks;
    }

    getTasksProgress(streamSimulator, newDF) {
        const finishedTasks = this.levelTasks.filter(
            lt => lt.checkValidation(
                streamSimulator.state == SimulationState.ENDED,
                this.sourceDF,
                newDF,
                streamSimulator.dag,
            )
        );

        return {
            finishedCount: finishedTasks.length,
            totalCount: this.levelTasks.length,
            finished: finishedTasks,
        };
    }
}