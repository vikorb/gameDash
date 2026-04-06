import type { Request } from "express";
import type { Knex } from "knex";
import { badRequest, forbidden, unauthorized } from "@/utils/httpError";

export type UserRow = {
  id: number;
  pocketbase_user_id: string | null;
  username: string | null;
  email: string | null;
  role: string;
  status: number;
  region: string | null;
  bio: string | null;
  language: string | null;
  matchmaking_pref: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AuthenticatedUser = {
  id: number;
  role: string;
  pocketbase_user_id: string | null;
};

export type DeletedFilter = "without" | "with" | "only";
export type UserSortOrder = "asc" | "desc";

export type UserSortBy =
  | "id"
  | "username"
  | "email"
  | "role"
  | "status"
  | "region"
  | "language"
  | "created_at"
  | "updated_at"
  | "deleted_at";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseUserStatus = (value: unknown): 1 | 2 | 3 | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = typeof value === "string" ? Number(value) : value;

  if (
    !Number.isInteger(parsed) ||
    (parsed !== 1 && parsed !== 2 && parsed !== 3)
  ) {
    throw badRequest(
      "status doit être 1 (online), 2 (offline) ou 3 (banni)",
      "VALIDATION_ERROR",
      { field: "status" },
    );
  }

  return parsed;
};

export const parseAdminStatusFilter = (
  value: unknown,
): 0 | 1 | 2 | 3 | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = typeof value === "string" ? Number(value) : value;

  if (
    !Number.isInteger(parsed) ||
    (parsed !== 0 && parsed !== 1 && parsed !== 2 && parsed !== 3)
  ) {
    throw badRequest(
      "status doit être 0 (supprimé), 1 (online), 2 (offline) ou 3 (banni)",
      "VALIDATION_ERROR",
      { field: "status" },
    );
  }

  return parsed;
};

export const parsePaginationNumber = (
  value: unknown,
  field: string,
  defaultValue: number,
  min: number,
  max: number,
): number => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw badRequest(`Paramètre ${field} invalide`, "VALIDATION_ERROR", {
      field,
    });
  }

  return parsed;
};

export const parseDeletedFilter = (value: unknown): DeletedFilter => {
  if (value === undefined || value === null || value === "") {
    return "without";
  }

  if (value === "without" || value === "with" || value === "only") {
    return value;
  }

  throw badRequest("Paramètre deleted invalide", "VALIDATION_ERROR", {
    field: "deleted",
  });
};

export const parseUserSortBy = (value: unknown): UserSortBy => {
  const allowed: UserSortBy[] = [
    "id",
    "username",
    "email",
    "role",
    "status",
    "region",
    "language",
    "created_at",
    "updated_at",
    "deleted_at",
  ];

  if (value === undefined || value === null || value === "") {
    return "created_at";
  }

  if (typeof value === "string" && allowed.includes(value as UserSortBy)) {
    return value as UserSortBy;
  }

  throw badRequest("Paramètre sortBy invalide", "VALIDATION_ERROR", {
    field: "sortBy",
  });
};

export const parseUserSortOrder = (value: unknown): UserSortOrder => {
  if (value === undefined || value === null || value === "") {
    return "desc";
  }

  if (value === "asc" || value === "desc") {
    return value;
  }

  throw badRequest("Paramètre sortOrder invalide", "VALIDATION_ERROR", {
    field: "sortOrder",
  });
};

export const getAuthUser = (req: Request): AuthenticatedUser => {
  const user = (req as Request & { user?: AuthenticatedUser }).user;

  if (!user) {
    throw unauthorized("Authentification requise", "UNAUTHORIZED");
  }

  if (typeof user.id !== "number" || typeof user.role !== "string") {
    throw unauthorized("Utilisateur authentifié invalide", "UNAUTHORIZED");
  }

  return {
    id: user.id,
    role: user.role,
    pocketbase_user_id: user.pocketbase_user_id ?? null,
  };
};

export const ensureAdmin = (req: Request): AuthenticatedUser => {
  const user = getAuthUser(req);

  if (user.role !== "admin") {
    throw forbidden("Accès réservé aux administrateurs", "FORBIDDEN");
  }

  return user;
};

export const ensureAdminOrSelf = (
  req: Request,
  targetUser: Pick<UserRow, "id" | "pocketbase_user_id">,
): AuthenticatedUser => {
  const user = getAuthUser(req);

  const isAdmin = user.role === "admin";
  const isSelfById = user.id === targetUser.id;
  const isSelfByPocketbaseId =
    !!user.pocketbase_user_id &&
    !!targetUser.pocketbase_user_id &&
    user.pocketbase_user_id === targetUser.pocketbase_user_id;

  if (!isAdmin && !isSelfById && !isSelfByPocketbaseId) {
    throw forbidden("Accès interdit à cet utilisateur", "FORBIDDEN");
  }

  return user;
};

export const applyUserFilters = (
  query: Knex.QueryBuilder<UserRow, unknown[]>,
  filters: {
    search?: string;
    role?: string;
    status?: 0 | 1 | 2 | 3;
    deleted: DeletedFilter;
  },
) => {
  if (filters.search) {
    const search = filters.search.trim();

    query.andWhere((qb) => {
      qb.whereILike("username", `%${search}%`)
        .orWhereILike("email", `%${search}%`)
        .orWhereILike("region", `%${search}%`)
        .orWhereILike("language", `%${search}%`);

      if (!Number.isNaN(Number(search))) {
        qb.orWhere("id", Number(search));
      }
    });
  }

  if (filters.role) {
    query.andWhere("role", filters.role);
  }

  if (filters.status !== undefined) {
    query.andWhere("status", filters.status);
  }

  if (filters.deleted === "without") {
    query.whereNull("deleted_at");
  }

  if (filters.deleted === "only") {
    query.whereNotNull("deleted_at");
  }

  return query;
};
