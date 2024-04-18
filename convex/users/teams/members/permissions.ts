import { Infer, v } from "convex/values";
import { MutationCtx, QueryCtx } from "../../../types";
import { Id } from "../../../_generated/dataModel";
import { query } from "../../../functions";
import { Role } from "../permissions/permissions";

export const vPermission2 = v.union(
  v.literal("Manage Team"),
  v.literal("Delete Team"),
  v.literal("Read Members"),
  v.literal("Manage Members"),
  v.literal("Contribute")
);
export type Permission2 = Infer<typeof vPermission2>;


export async function getPermission2(ctx: QueryCtx, name: Permission2) {
  return (await ctx.table("permissions2").getX("name", name))._id;
}

export async function getRole(ctx: QueryCtx, name: Role) {
  return await ctx.table("roles").getX("name", name);
}

export async function viewerWithPermission(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  name: Permission2
) {
  const member = await ctx
    .table("members", "teamUser", (q) =>
      q.eq("teamId", teamId).eq("userId", ctx.viewerX()._id)
    )
    .unique();
  if (
    member === null ||
    member.deletionTime !== undefined ||
    !(await member
      .edge("role")
      .edge("permissions2")
      .has(await getPermission2(ctx, name)))
  ) {
    return null;
  }
  return member;
}

export async function viewerHasPermission2(
  ctx: QueryCtx,
  teamId: Id<"teams">,
  name: Permission2
) {
  const member = await viewerWithPermission(ctx, teamId, name);
  return member !== null;
}

export async function viewerWithPermissionX2(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  name: Permission2
) {
  const member = await viewerWithPermission(ctx, teamId, name);
  if (member === null) {
    throw new Error(`Viewer does not have the permission "${name}"`);
  }
  return member;
}

export async function viewerHasPermissionX2(
  ctx: MutationCtx,
  teamId: Id<"teams">,
  name: Permission2
) {
  await viewerWithPermissionX2(ctx, teamId, name);
  return true;
}

export const getMemberPermissionList = query({
  args: {},
  async handler(ctx) {
    const permissions = await ctx.table("permissions2").map((permission) => ({
      _id: permission._id,
      name: permission.name,
    }));
    return permissions;
  },
});