/**
 * Heuristics for reading "standard" contact data out of arbitrary form fields.
 * Every website has its own lead schema (`Website.leadSchema`), so the keys
 * differ ("name", "fullName", "Ім'я", "Telefone_number", ...).
 */

export type LeadSchemaFieldLike = {
  key: string;
  label?: string;
  type?: string;
  currency?: string;
};

const PHONE_RE = /phone|mobile|tel|телефон|мобіль/i;
const NAME_RE = /name|ім.?я|піб|contact|прізвище/i;
const EMAIL_RE = /e-?mail|пошт/i;
const EMAIL_VALUE_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const describe = (field: LeadSchemaFieldLike) => `${field.key} ${field.label ?? ""}`;

export const isPhoneField = (field: LeadSchemaFieldLike) =>
  field.type === "phone" || field.type === "tel" || PHONE_RE.test(describe(field));
export const isEmailField = (field: LeadSchemaFieldLike) =>
  field.type === "email" || EMAIL_RE.test(describe(field));
export const isNameField = (field: LeadSchemaFieldLike) =>
  !isPhoneField(field) && !isEmailField(field) && NAME_RE.test(describe(field));

export function asSchema(value: unknown): LeadSchemaFieldLike[] {
  return Array.isArray(value)
    ? (value as LeadSchemaFieldLike[]).filter(
        (field) => field && typeof field.key === "string",
      )
    : [];
}

export function asFields(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value).trim();

export type LeadContactSummary = {
  name: string;
  phone: string;
  email: string;
  /** Remaining non-empty fields in schema order (label + raw value). */
  other: { key: string; label: string; value: string }[];
};

export function summarizeLeadFields(
  rawFields: unknown,
  rawSchema: unknown,
): LeadContactSummary {
  const fields = asFields(rawFields);
  const schema = asSchema(rawSchema);
  // Keys that exist in the data but not (or no longer) in the schema.
  const known = new Set(schema.map((field) => field.key));
  const all: LeadSchemaFieldLike[] = [
    ...schema,
    ...Object.keys(fields)
      .filter((key) => !known.has(key))
      .map((key) => ({ key })),
  ];

  const used = new Set<string>();
  const pick = (predicate: (field: LeadSchemaFieldLike) => boolean) => {
    const field = all.find((item) => !used.has(item.key) && predicate(item) && text(fields[item.key]));
    if (!field) return "";
    used.add(field.key);
    return text(fields[field.key]);
  };

  const name = pick(isNameField);
  const phone = pick(isPhoneField);
  let email = pick(isEmailField);
  if (!email) email = pick((field) => EMAIL_VALUE_RE.test(text(fields[field.key])));

  const other = all
    .filter((field) => !used.has(field.key) && text(fields[field.key]))
    .map((field) => ({
      key: field.key,
      label: field.label || field.key,
      value: typeof fields[field.key] === "boolean" ? (fields[field.key] ? "✓" : "✗") : text(fields[field.key]),
    }));

  return { name, phone, email, other };
}
