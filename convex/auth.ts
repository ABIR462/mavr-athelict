import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mock user login
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const password = args.password.trim();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      // Create user if not exists (for demo purposes)
      const newUserId = await ctx.db.insert("users", {
        email,
        password,
        name: email.split("@")[0],
      });
      return newUserId;
    }

    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    return user._id;
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
