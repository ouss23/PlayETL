import { Schema } from "./schema.js";

export class Row {
  constructor(values, schema) {
    this.values = values;
    this.schema = schema;
  }

  getCellValue(columnName) {
    if(this.schema.columns.findIndex(c => c.name == columnName) < 0)
      throw new Error("Row has no column named '" + columnName + "'");
    return this.values[this.schema.columns.findIndex(c => c.name == columnName)];
  }

  setCellValue(columnName, value) {
    if(this.schema.columns.findIndex(c => c.name == columnName) < 0)
      throw new Error("Row has no column named '" + columnName + "'");

    this.values[this.schema.columns.findIndex(c => c.name == columnName)] = value;
    return this;
  }

  copy() {
    return new Row(this.values.map(v => v), this.schema);
  }

  valuesEqual(other) {
    for(let i = 0; i < this.values.length; i++) {
      if(this.values[i] != other.values[i])
        return false;
    }

    return true;
  }
}