import type { Access, FieldAccess } from "payload";

/**
 * Role-based access helpers. Roles live on the `users` collection
 * (`admin` | `editor`). Default posture: deny unless explicitly allowed.
 */
export const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const isEditorOrAdmin: Access = ({ req }) =>
  req.user?.role === "admin" || req.user?.role === "editor";

/** Field-level guard — only admins may set the field (e.g. a user's role). */
export const adminFieldAccess: FieldAccess = ({ req }) =>
  req.user?.role === "admin";
