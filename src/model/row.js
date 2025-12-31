import { Schema } from "./schema.js";

export class Row {
  constructor(values, schema) {
    this.values = values;
    this.schema = schema;
  }
}