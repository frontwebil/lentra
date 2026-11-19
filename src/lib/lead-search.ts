import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { LEAD_SEARCH_MAX_LENGTH } from "./lead-search-constants";

/** Lower-case, unified apostrophes, collapsed whitespace. */
export function normalizeSearchText(value: string) {
  return value
    .replace(/[’ʼ‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Reads `?q=` safely (string, trimmed, bounded length). */
export function parseLeadSearchQuery(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, LEAD_SEARCH_MAX_LENGTH);
}

// LIKE wildcards are dropped instead of escaped: nobody searches for them.
const stripWildcards = (value: string) => value.replace(/[%_\\]/g, "");

/**
 * Finds the ids of the user's leads that match a search query.
 * Returns `null` when the query is empty (= no search filter).
 *
 * Form fields differ per website (`Lead.fields` is arbitrary JSON), so the
 * search does not look at specific keys. For every lead it builds, on the fly:
 *   - a text haystack: all values of `fields` + the linked client's name and
 *     phone, lower-cased, apostrophes unified;
 *   - a digits haystack: every value (and the client phone) with non-digits
 *     removed, values kept apart by spaces.
 * A phone-like query ("067 100", "+38 (067) 100-00") is matched as one digit
 * sequence against the digits haystack; any other query must contain every
 * word somewhere in the text haystack.
 *
 * Always scoped by `userId` (and optionally `websiteId`), so a search can never
 * return another company's leads. No extra columns, indexes or migrations:
 * for a small business CRM (hundreds to tens of thousands of leads per company)
 * a sequential scan of the company's leads is fast enough.
 */
export async function findLeadIdsBySearch(
  query: string,
  scope: { userId: string; websiteId?: string },
): Promise<string[] | null> {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;

  const digits = normalized.replace(/\D/g, "");
  const isPhoneLike = /^[\d\s+()\-.]+$/.test(normalized) && digits.length >= 3;

  const terms = isPhoneLike
    ? []
    : normalized.split(" ").map(stripWildcards).filter(Boolean);
  if (!isPhoneLike && !terms.length) return null;

  const conditions = isPhoneLike
    ? [Prisma.sql`h.digits LIKE ${`%${digits}%`}`]
    : terms.map((term) => Prisma.sql`h.txt LIKE ${`%${term}%`}`);

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT l.id
    FROM "Lead" l
    LEFT JOIN "Client" c ON c.id = l."clientId" AND c."userId" = l."userId"
    CROSS JOIN LATERAL (
      SELECT
        lower(regexp_replace(
          concat_ws(' ', string_agg(e.value, ' '), c.name, c.phone),
          ${"[’ʼ‘`]"}, ${"'"}, 'g'
        )) AS txt,
        concat_ws(' ',
          string_agg(regexp_replace(e.value, ${"\\D"}, '', 'g'), ' '),
          regexp_replace(coalesce(c.phone, ''), ${"\\D"}, '', 'g')
        ) AS digits
      FROM jsonb_each_text(
        CASE WHEN jsonb_typeof(l.fields) = 'object' THEN l.fields ELSE '{}'::jsonb END
      ) AS e(key, value)
    ) h
    WHERE l."userId" = ${scope.userId}
      ${scope.websiteId ? Prisma.sql`AND l."websiteId" = ${scope.websiteId}` : Prisma.empty}
      AND ${Prisma.join(conditions, " AND ")}
  `;

  return rows.map((row) => row.id);
}

/**
 * Prisma filter for a search: `undefined` = no search, otherwise restricts to
 * the matching ids (an empty list matches nothing).
 */
export async function buildLeadSearchWhere(
  query: string,
  scope: { userId: string; websiteId?: string },
): Promise<Prisma.LeadWhereInput | undefined> {
  const ids = await findLeadIdsBySearch(query, scope);
  return ids === null ? undefined : { id: { in: ids } };
}

/** Statuses that mean "new" (see update-lead route). */
export const NEW_STATUS_TEXTS = ["New", "Новий", "Новый"];

/** Prisma filter for the JSON `status` column by status name. */
export function buildLeadStatusWhere(status: string): Prisma.LeadWhereInput | undefined {
  if (!status) return undefined;
  if (status.toLowerCase() === "new") {
    return {
      OR: NEW_STATUS_TEXTS.map((text) => ({ status: { path: ["text"], equals: text } })),
    };
  }
  return { status: { path: ["text"], equals: status } };
}
