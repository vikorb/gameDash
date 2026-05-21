import type { AuthenticatedUser } from "@/utils/users";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};