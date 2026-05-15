import { defineSchema } from "convex/server";
import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  // Custom indexes (safe to regenerate - this file won't be overwritten)
  user: tables.user
    .index("role", ["role"])
    .index("createdAt", ["createdAt"])
    .index("updatedAt", ["updatedAt"]),
});

export default schema;
