import { Schema } from "./schema.js";
import { Row } from "./row.js";

export class DataFrame {
  constructor(schema, rows) {
    this.schema = schema;
    this.rows = rows;
  }

  constructor(schema, rows_values) {
    this.schema = schema;
    this.rows = rows_values.map(e => new Row(e, schema));
  }
}