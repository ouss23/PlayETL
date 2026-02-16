import { Schema } from "./schema.js";
import { Row } from "./row.js";

export class DataFrame {
  constructor(name, schema, rows = []) {
    this.name = name;
    this.schema = schema;
    this.rows = rows;
  }

  /*constructor(schema, rows_values) {
    this.schema = schema;
    this.rows = rows_values.map(e => new Row(e, schema));
  }*/
}