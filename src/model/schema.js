import { Column } from "./column.js";

export class Schema {
  constructor(columns) {
    this.columns = columns;
    /*this.columnMap = new Map(
      columns.map(col => [col.name, col])
    );*/
  }

  /*has(name) {
    return this.columnMap.has(name);
  }

  get(name) {
    return this.columnMap.get(name);
  }*/
}
