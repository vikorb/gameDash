import { badRequest } from "@/utils/httpError";

export const parsePositiveInt = (value: unknown, fieldName: string): number => {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(
      `${fieldName} doit être un entier positif`,
      "VALIDATION_ERROR",
      { field: fieldName },
    );
  }
  return n;
};

export const parseString = (
  value: unknown,
  fieldName: string,
  opts?: { min?: number; max?: number; optional?: boolean; trim?: boolean },
): string | undefined => {
  const { min = 1, max = 255, optional = false, trim = true } = opts ?? {};

  if (value == null || value === "") {
    if (optional) return undefined;
    throw badRequest(`${fieldName} est requis`, "VALIDATION_ERROR", {
      field: fieldName,
    });
  }
  if (typeof value !== "string") {
    throw badRequest(`${fieldName} doit être une chaîne`, "VALIDATION_ERROR", {
      field: fieldName,
    });
  }

  const s = trim ? value.trim() : value;

  if (s.length < min)
    throw badRequest(
      `${fieldName} est trop court (min ${min})`,
      "VALIDATION_ERROR",
      { field: fieldName },
    );
  if (s.length > max)
    throw badRequest(
      `${fieldName} est trop long (max ${max})`,
      "VALIDATION_ERROR",
      { field: fieldName },
    );

  return s;
};

export const parseParamId = (param: string | string[], name = "id"): number => {
  const raw = Array.isArray(param) ? param[0] : param;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0)
    throw badRequest(`${name} invalide`, "VALIDATION_ERROR");
  return n;
};
