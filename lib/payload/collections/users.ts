import type { CollectionConfig } from "payload";
import { adminFieldAccess } from "../access/roles";

/**
 * Auth collection. Email/password login, HTTP-only JWT cookie (Payload default).
 * Roles: admin (full CRUD + user mgmt) / editor (content CRUD only).
 */
export const users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    useAPIKey: false,
  },
  admin: { useAsTitle: "email", defaultColumns: ["name", "email", "role"] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req, id }) =>
      req.user?.role === "admin" || req.user?.id === id,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      // Editors cannot promote themselves; only admins set roles.
      access: { update: adminFieldAccess },
    },
  ],
};
