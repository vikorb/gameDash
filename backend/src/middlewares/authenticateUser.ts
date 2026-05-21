import type { NextFunction, Request, Response } from "express";
import db from "@/database";
import { unauthorized } from "@/utils/httpError";
import type { UserRow } from "@/utils/users";

const PB_URL = process.env.POCKETBASE_INTERNAL_URL ?? "http://pocketbase:8090";

type PocketBaseAuthRefreshResponse = {
  record?: {
    id?: string;
    email?: string;
    role?: string;
  };
};

type PocketBaseTokenPayload = {
  id?: string;
  exp?: number;
};

const extractToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const headerValue = authorizationHeader.trim();
  if (!headerValue) {
    return null;
  }

  if (headerValue.toLowerCase().startsWith("bearer ")) {
    const bearerToken = headerValue.slice(7).trim();
    return bearerToken || null;
  }

  return headerValue;
};

const decodePocketBaseToken = (token: string): PocketBaseTokenPayload | null => {
  const tokenParts = token.split(".");
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payloadText = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(payloadText) as PocketBaseTokenPayload;

    if (typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSeconds) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
};

export async function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req.header("authorization"));
    if (!token) {
      throw unauthorized("Authentification requise", "UNAUTHORIZED");
    }

    let authPayload: PocketBaseAuthRefreshResponse | null = null;

    const pbResponse = await fetch(`${PB_URL}/api/collections/users/auth-refresh`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
    });

    if (pbResponse.ok) {
      authPayload = (await pbResponse.json()) as PocketBaseAuthRefreshResponse;
    }

    const decodedPayload = decodePocketBaseToken(token);
    const pocketbaseUserId = authPayload?.record?.id ?? decodedPayload?.id;

    if (!pocketbaseUserId) {
      throw unauthorized("Session invalide", "UNAUTHORIZED");
    }

    const user = await db<UserRow>("users")
      .select("id", "role", "pocketbase_user_id")
      .where("pocketbase_user_id", pocketbaseUserId)
      .first();

    const requestWithUser = req as Request & {
      user?: {
        id: number;
        role: string;
        pocketbase_user_id: string | null;
      };
    };

    if (user) {
      const normalizedId =
        typeof user.id === "number"
          ? user.id
          : typeof user.id === "string"
            ? Number(user.id)
            : NaN;

      if (!Number.isFinite(normalizedId)) {
        throw unauthorized("Utilisateur authentifié invalide", "UNAUTHORIZED");
      }

      requestWithUser.user = {
        id: normalizedId,
        role: user.role,
        pocketbase_user_id: user.pocketbase_user_id,
      };
    } else {
      // Fallback to PocketBase identity when local profile sync is not done yet.
      requestWithUser.user = {
        id: -1,
        role: typeof authPayload?.record?.role === "string" ? authPayload.record.role : "player",
        pocketbase_user_id: pocketbaseUserId,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}