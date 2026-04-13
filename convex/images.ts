import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.id("users"),
    format: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);

    await ctx.db.insert("images", {
      userId: args.userId,
      storageId: args.storageId,
      format: args.format,
      name: args.name,
      url: url || undefined,
      uploadedAt: Date.now(),
    });
  },
});

export const getImages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const hydratedImages = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: (await ctx.storage.getUrl(image.storageId)) ?? image.url ?? null,
      })),
    );

    return hydratedImages.sort((left, right) => right.uploadedAt - left.uploadedAt);
  },
});
