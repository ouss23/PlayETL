import { Schema } from "./schema.js";
import { Row } from "./row.js";
import { RowRenderer } from "../view/row_renderer.js";

export class DataFrame {
  constructor(name, schema, rows = []) {
    this.name = name;
    this.schema = schema;
    this.rows = rows;
  }

  copy() {
    return new DataFrame(
      this.name,
      this.schema,
      this.rows.map(r => r.copy())
    );
  }

  static generateShapes(name, entries) {
    return new DataFrame(
      name,
      RowRenderer.shapeSchema,
      entries.map(e => new Row(e, RowRenderer.shapeSchema)),
    );
  }
}