import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import aggregate from "@convex-dev/aggregate/convex.config.js";

const app = defineApp();

app.use(betterAuth);
app.use(aggregate, { name: "aggregatePipeline" });
app.use(aggregate, { name: "aggregatePipelineBySalesPerson" });
app.use(aggregate, { name: "aggregateInteractionsByUser" });
app.use(aggregate, { name: "aggregateMeetingsByUser" });

export default app;