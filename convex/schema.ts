import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  users: defineTable({
    email: v.string(),
    password: v.string(), // mocked auth for now
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),
  images: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    format: v.string(),
    name: v.optional(v.string()),
    url: v.optional(v.string()), // cached url
    uploadedAt: v.number(),      // timestamp
  }).index("by_user", ["userId"]),
});
