import { Router } from "express";
import db from "@/database";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authenticateUser } from "@/middlewares/authenticateUser";
import { badRequest, notFound } from "@/utils/httpError";
import { parseParamId, parseString } from "@/utils/validators";
import {
  authPocketbaseUser,
  createPocketbaseUser,
  getPocketbaseUser,
  updatePocketbaseUser,
  uploadPocketbaseAvatar,
} from "@/utils/pocketBase";
import {
  applyUserFilters,
  ensureAdmin,
  ensureAdminOrSelf,
  isRecord,
  parseAdminStatusFilter,
  parseDeletedFilter,
  parsePaginationNumber,
  parseUserSortBy,
  parseUserSortOrder,
  parseUserStatus,
  type UserRow,
} from "@/utils/users";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest("Invalid payload", "VALIDATION_ERROR");
    }

    const pocketbase_user_id = parseString(
      body.pocketbase_user_id,
      "pocketbase_user_id",
      { min: 1, max: 64 },
    )!;
    const username = parseString(body.username, "username", {
      min: 1,
      max: 255,
      optional: true,
    });
    const email = parseString(body.email, "email", {
      min: 3,
      max: 255,
      optional: true,
    });
    const password = parseString(body.password, "password", {
      min: 8,
      max: 128,
      optional: true,
    });
    const role = parseString(body.role, "role", {
      min: 1,
      max: 32,
      optional: true,
    });
    const status = parseUserStatus(body.status);
    const region = parseString(body.region, "region", {
      min: 1,
      max: 64,
      optional: true,
    });
    const bio = parseString(body.bio, "bio", {
      min: 0,
      max: 2000,
      optional: true,
    });
    const language = parseString(body.language, "language", {
      min: 1,
      max: 8,
      optional: true,
    });

    const existing = await db<UserRow>("users")
      .where("pocketbase_user_id", pocketbase_user_id)
      .first();

    if (existing) {
      const updates: Partial<Pick<UserRow, "username" | "email">> = {};
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;

      if (Object.keys(updates).length === 0) {
        return res
          .status(200)
          .json({ status: "already_exists", user: existing });
      }

      const updatedRows = (await db<UserRow>("users")
        .where("id", existing.id)
        .update(updates)
        .returning("*")) as UserRow[];

      return res
        .status(200)
        .json({ status: "already_exists", user: updatedRows[0] });
    }

    if (password && email) {
      await createPocketbaseUser({
        email,
        password,
        passwordConfirm: password,
        username: username ?? undefined,
      });
    }

    const createdRows = (await db<UserRow>("users")
      .insert({
        pocketbase_user_id,
        username: username ?? null,
        email: email ?? null,
        role: role ?? "player",
        status: status ?? 1,
        region: region ?? null,
        bio: bio ?? null,
        language: language ?? null,
        matchmaking_pref: body.matchmaking_pref ?? null,
      })
      .returning("*")) as UserRow[];

    const newUser = createdRows[0];

    const gameModes = await db("game_modes").select("id");

    if (gameModes.length > 0) {
      await db("player_mmr")
        .insert(
          gameModes.map((gm: { id: number }) => ({
            user_id: newUser.id,
            mode_id: gm.id,
            mmr: 1000,
          })),
        )
        .onConflict(["user_id", "mode_id"])
        .ignore();

      await db("user_ranks")
        .insert(
          gameModes.map((gm: { id: number }) => ({
            user_id: newUser.id,
            game_modes_id: gm.id,
            xp: 0,
          })),
        )
        .onConflict(["user_id", "game_modes_id"])
        .ignore();
    }

    return res.status(201).json({ status: "created", user: newUser });
  }),
);

router.get(
  "/",
  authenticateUser,
  asyncHandler(async (req, res) => {
    ensureAdmin(req);

    const search = parseString(req.query.search, "search", {
      min: 1,
      max: 255,
      optional: true,
    });
    const role = parseString(req.query.role, "role", {
      min: 1,
      max: 32,
      optional: true,
    });
    const status = parseAdminStatusFilter(req.query.status);
    const deleted = parseDeletedFilter(req.query.deleted);
    const page = parsePaginationNumber(req.query.page, "page", 1, 1, 100000);
    const limit = parsePaginationNumber(req.query.limit, "limit", 20, 1, 100);
    const sortBy = parseUserSortBy(req.query.sortBy);
    const sortOrder = parseUserSortOrder(req.query.sortOrder);

    const filters = {
      search,
      role,
      status,
      deleted,
    };

    const totalQuery = db<UserRow>("users");
    applyUserFilters(totalQuery, filters);

    const totalResult = await totalQuery
      .count<{ count: string }>({ count: "*" })
      .first();

    const total = Number(totalResult?.count ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const usersQuery = db<UserRow>("users").select("*");
    applyUserFilters(usersQuery, filters);

    const users = await usersQuery
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        search: search ?? null,
        role: role ?? null,
        status: status ?? null,
        deleted,
        sortBy,
        sortOrder,
      },
    });
  }),
);

router.get(
  "/by-pocketbase/:pocketbaseUserId",
  asyncHandler(async (req, res) => {
    const pocketbaseUserId = parseString(
      req.params.pocketbaseUserId,
      "pocketbaseUserId",
      { min: 1, max: 64 },
    )!;

    const user = await db<UserRow>("users")
      .where("pocketbase_user_id", pocketbaseUserId)
      .first();

    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", {
        pocketbaseUserId,
      });
    }

    return res.status(200).json({ user });
  }),
);

router.get(
  "/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);
    if (Number.isNaN(id)) {
      throw badRequest("ID invalide", "VALIDATION_ERROR");
    }

    const user = await db<UserRow>("users").where("id", id).first();

    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }

    ensureAdminOrSelf(req, user);

    return res.status(200).json({ user });
  }),
);

router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);

    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest("Invalid payload", "VALIDATION_ERROR");
    }

    const user = await db<UserRow>("users").where("id", id).first();
    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }

    const username = parseString(body.username, "username", {
      min: 1,
      max: 255,
      optional: true,
    });
    const email = parseString(body.email, "email", {
      min: 3,
      max: 255,
      optional: true,
    });
    const role = parseString(body.role, "role", {
      min: 1,
      max: 32,
      optional: true,
    });
    const region = parseString(body.region, "region", {
      min: 1,
      max: 64,
      optional: true,
    });
    const bio = parseString(body.bio, "bio", {
      min: 0,
      max: 2000,
      optional: true,
    });
    const language = parseString(body.language, "language", {
      min: 1,
      max: 8,
      optional: true,
    });
    const status = parseUserStatus(body.status);

    const updates: Partial<UserRow> = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (region !== undefined) updates.region = region;
    if (bio !== undefined) updates.bio = bio;
    if (language !== undefined) updates.language = language;
    if (status !== undefined) updates.status = status;
    if (body.matchmaking_pref !== undefined) {
      updates.matchmaking_pref = body.matchmaking_pref;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ status: "no_changes", user });
    }
    
    if (user.pocketbase_user_id && user.email && (email || username)) {
      const currentPassword = parseString(
        body.currentPassword,
        "currentPassword",
        { min: 1, max: 128 },
      )!;
      const { token: userToken } = await authPocketbaseUser(
        user.email,
        currentPassword,
      );

      const pbBody: Record<string, string> = {};
      if (email) pbBody.email = email;
      if (username) pbBody.username = username;

      await updatePocketbaseUser(user.pocketbase_user_id, pbBody, userToken);
    }

    const updatedRows = (await db<UserRow>("users")
      .where("id", id)
      .update({ ...updates, updated_at: db.fn.now() })
      .returning("*")) as UserRow[];

    return res.status(200).json({ status: "updated", user: updatedRows[0] });
  }),
);

router.post(
  "/:id/avatar",
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);

    const user = await db<UserRow>("users").where("id", id).first();
    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }
    if (!user.pocketbase_user_id) {
      throw badRequest("Pas de compte PocketBase lié", "NO_POCKETBASE_ACCOUNT");
    }
    if (!user.email) {
      throw badRequest("Email manquant sur ce compte", "MISSING_EMAIL");
    }

    const body: unknown = req.body;
    if (
      !isRecord(body) ||
      typeof body.avatar !== "string" ||
      typeof body.currentPassword !== "string"
    ) {
      throw badRequest(
        "Champs avatar (base64) et currentPassword requis",
        "VALIDATION_ERROR",
      );
    }

    const { token: userToken } = await authPocketbaseUser(
      user.email,
      body.currentPassword,
    );

    const avatarUrl = await uploadPocketbaseAvatar(
      user.pocketbase_user_id,
      body.avatar,
      userToken,
    );

    return res.status(200).json({ status: "updated", avatar_url: avatarUrl });
  }),
);

router.get(
  "/:id/avatar",
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);
    if (Number.isNaN(id)) {
      throw badRequest("ID invalide", "VALIDATION_ERROR");
    }

    const user = await db<UserRow>("users").where("id", id).first();
    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }
    if (!user.pocketbase_user_id) {
      throw badRequest("Pas de compte PocketBase lié", "NO_POCKETBASE_ACCOUNT");
    }

    const pbUser = await getPocketbaseUser(user.pocketbase_user_id);
    const avatar = typeof pbUser?.avatar === "string" ? pbUser.avatar : null;

    const avatarUrl = avatar
      ? `${process.env.VITE_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.pocketbase_user_id}/${avatar}`
      : null;

    return res.status(200).json({ avatar_url: avatarUrl });
  }),
);

router.post(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);

    const user = await db<UserRow>("users").where("id", id).first();
    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }
    if (!user.pocketbase_user_id) {
      throw badRequest("Pas de compte PocketBase lié", "NO_POCKETBASE_ACCOUNT");
    }
    if (!user.email) {
      throw badRequest("Email manquant sur ce compte", "MISSING_EMAIL");
    }

    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest("Invalid payload", "VALIDATION_ERROR");
    }

    const currentPassword = parseString(
      body.currentPassword,
      "currentPassword",
      { min: 1, max: 128 },
    )!;
    const password = parseString(body.password, "password", {
      min: 8,
      max: 128,
    })!;
    const passwordConfirm = parseString(
      body.passwordConfirm,
      "passwordConfirm",
      { min: 8, max: 128 },
    )!;

    if (password !== passwordConfirm) {
      throw badRequest(
        "Les mots de passe ne correspondent pas",
        "VALIDATION_ERROR",
        {
          field: "passwordConfirm",
        },
      );
    }

    const { token: userToken } = await authPocketbaseUser(
      user.email,
      currentPassword,
    );

    await updatePocketbaseUser(
      user.pocketbase_user_id,
      { password, passwordConfirm },
      userToken,
    );

    return res.status(200).json({ status: "password_updated" });
  }),
);

router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const id = parseParamId(req.params.id);

    const user = await db<UserRow>("users").where("id", id).first();
    if (!user) {
      throw notFound("Utilisateur introuvable", "USER_NOT_FOUND", { id });
    }

    if (!user.pocketbase_user_id) {
      throw badRequest("Pas de compte PocketBase lié", "NO_POCKETBASE_ACCOUNT");
    }

    if (!user.email) {
      throw badRequest("Email manquant sur ce compte", "MISSING_EMAIL");
    }

    const body: unknown = req.body;
    if (!isRecord(body)) {
      throw badRequest("Invalid payload", "VALIDATION_ERROR");
    }

    const currentPassword = parseString(
      body.currentPassword,
      "currentPassword",
      { min: 1, max: 128 },
    )!;

    await authPocketbaseUser(user.email, currentPassword);

    if (user.deleted_at) {
      return res.status(200).json({ status: "already_deleted", user });
    }

    const updatedRows = (await db<UserRow>("users")
      .where("id", id)
      .update({
        status: 0,
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning("*")) as UserRow[];

    return res.status(200).json({
      status: "deleted",
      user: updatedRows[0],
    });
  }),
);

export default router;
