import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";

const STATUS_ORDER = {
  prospect: 0,
  initial_contact: 1,
  negotiation: 2,
  verbal_agreement: 3,
  converted: 4,
  lost: 5,
  out_of_target: 6,
} as const;

type StatusKey = keyof typeof STATUS_ORDER;

export const aggregatePipeline = new TableAggregate<{
  Key: [number, string];
  DataModel: DataModel;
  TableName: "clients";
}>(components.aggregatePipeline, {
  sortKey: (doc) => [STATUS_ORDER[doc.status as StatusKey], doc._id],
});

export const aggregatePipelineBySalesPerson = new TableAggregate<{
  Namespace: string;
  Key: [number, string];
  DataModel: DataModel;
  TableName: "clients";
}>(components.aggregatePipelineBySalesPerson, {
  namespace: (doc) => doc.salesPersonId ?? "__unassigned__",
  sortKey: (doc) => [STATUS_ORDER[doc.status as StatusKey], doc._id],
});

export const aggregateInteractionsByUser = new TableAggregate<{
  Namespace: string;
  Key: [number, string];
  DataModel: DataModel;
  TableName: "clientInteractions";
}>(components.aggregateInteractionsByUser, {
  namespace: (doc) => doc.userId,
  sortKey: (doc) => [doc.updatedAt, doc._id],
});

export const aggregateMeetingsByUser = new TableAggregate<{
  Namespace: string;
  Key: [number, string];
  DataModel: DataModel;
  TableName: "clientMeetings";
}>(components.aggregateMeetingsByUser, {
  namespace: (doc) => doc.userId,
  sortKey: (doc) => [doc.updatedAt, doc._id],
});

export function statusToKey(status: StatusKey): number {
  return STATUS_ORDER[status];
}

export function keyToStatus(key: number): StatusKey | undefined {
  const reverse = Object.entries(STATUS_ORDER).find(([, v]) => v === key);
  return reverse?.[0] as StatusKey | undefined;
}
