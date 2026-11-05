// Checkout rules shared by the checkout form (inline validation) and
// POST /api/checkout, which re-validates the whole request and re-prices every
// line from the catalog. Nothing in here touches the DOM, so it runs on both sides.

import { COLOR_BY_ID, colorFor } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { PRODUCT_BY_SLUG } from "@/lib/data/products";
import { hasPrint, type Design, type Layer } from "@/lib/design";
import { BACK_PRINT_PRICE, GARMENTS, type GarmentId, type GarmentView } from "@/lib/garments";
import { SHIPPING_METHODS, findPromo, type ShippingMethodId, type Totals } from "@/lib/pricing";
import type { CartLine } from "@/lib/store/cart";
import type { Address } from "@/lib/store/library";

// ---------------------------------------------------------------------------
// Where we ship
// ---------------------------------------------------------------------------

type Options = readonly (readonly [code: string, name: string])[];

export type Country = {
  code: string;
  name: string;
  region?: { label: string; required: boolean; options?: Options };
  postal: { label: string; placeholder: string; pattern: RegExp; required: boolean };
};

const US_STATES: Options = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

const CA_PROVINCES: Options = [
  ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"], ["NS", "Nova Scotia"], ["NT", "Northwest Territories"], ["NU", "Nunavut"],
  ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"], ["SK", "Saskatchewan"], ["YT", "Yukon"],
];

const AU_STATES: Options = [
  ["ACT", "Australian Capital Territory"], ["NSW", "New South Wales"], ["NT", "Northern Territory"], ["QLD", "Queensland"],
  ["SA", "South Australia"], ["TAS", "Tasmania"], ["VIC", "Victoria"], ["WA", "Western Australia"],
];

const postal = (label: string, placeholder: string, pattern: RegExp, required = true) => ({ label, placeholder, pattern, required });

export const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    region: { label: "State", required: true, options: US_STATES },
    postal: postal("ZIP code", "10001", /^\d{5}(?:-\d{4})?$/),
  },
  {
    code: "CA",
    name: "Canada",
    region: { label: "Province", required: true, options: CA_PROVINCES },
    postal: postal("Postal code", "M5V 2T6", /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i),
  },
  {
    code: "GB",
    name: "United Kingdom",
    region: { label: "County", required: false },
    postal: postal("Postcode", "E1 6AN", /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i),
  },
  {
    code: "IE",
    name: "Ireland",
    region: { label: "County", required: false },
    postal: postal("Eircode", "D02 X285", /^[A-Z\d]{3} ?[A-Z\d]{4}$/i, false),
  },
  {
    code: "AU",
    name: "Australia",
    region: { label: "State", required: true, options: AU_STATES },
    postal: postal("Postcode", "2000", /^\d{4}$/),
  },
  { code: "NZ", name: "New Zealand", postal: postal("Postcode", "1010", /^\d{4}$/) },
  { code: "DE", name: "Germany", postal: postal("Postcode", "10115", /^\d{5}$/) },
  { code: "FR", name: "France", postal: postal("Postcode", "75001", /^\d{5}$/) },
  { code: "NL", name: "Netherlands", postal: postal("Postcode", "1012 AB", /^\d{4} ?[A-Z]{2}$/i) },
  { code: "SE", name: "Sweden", postal: postal("Postcode", "111 22", /^\d{3} ?\d{2}$/) },
  {
    code: "JP",
    name: "Japan",
    region: { label: "Prefecture", required: true },
    postal: postal("Postcode", "150-0001", /^\d{3}-?\d{4}$/),
  },
];

export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

export function countryFor(code: string): Country | undefined {
  return Object.hasOwn(COUNTRY_BY_CODE, code) ? COUNTRY_BY_CODE[code] : undefined;
}

/** Display name for a region code ("CA" → "California"), or the value as typed. */
export function regionName(country: string, region: string): string {
  return countryFor(country)?.region?.options?.find(([code]) => code === region)?.[1] ?? region;
}

// ---------------------------------------------------------------------------
// Contact + address validation
// ---------------------------------------------------------------------------

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your email address";
  if (v.length > 254 || !EMAIL.test(v)) return "That email doesn't look right";
  return null;
}

export type AddressField = keyof Address;
export type AddressErrors = Partial<Record<AddressField, string>>;

/** The order fields appear in the form, so the first error is the first field to fix. */
export const ADDRESS_FIELDS: AddressField[] = [
  "country",
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "region",
  "postal",
  "phone",
];

export const EMPTY_ADDRESS: Address = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  region: "",
  postal: "",
  country: "US",
  phone: "",
};

function text(value: string | undefined, { required, max, missing }: { required: boolean; max: number; missing: string }) {
  const v = (value ?? "").trim();
  if (!v) return required ? missing : undefined;
  if (v.length > max) return `Keep it under ${max} characters`;
  return undefined;
}

export function validateAddress(a: Address): AddressErrors {
  const errors: AddressErrors = {};
  const set = (field: AddressField, message: string | undefined) => {
    if (message) errors[field] = message;
  };
  const country = countryFor(a.country);

  set("country", country ? undefined : "Choose a country we ship to");
  set("firstName", text(a.firstName, { required: true, max: 60, missing: "Enter a first name" }));
  set("lastName", text(a.lastName, { required: true, max: 60, missing: "Enter a last name" }));
  set("address1", text(a.address1, { required: true, max: 120, missing: "Enter a street address" }));
  set("address2", text(a.address2, { required: false, max: 120, missing: "" }));
  set("city", text(a.city, { required: true, max: 80, missing: "Enter a city" }));

  if (country?.region) {
    const { label, required, options } = country.region;
    const region = a.region.trim();
    if (options) {
      if (!region && required) set("region", `Choose your ${label.toLowerCase()}`);
      else if (region && !options.some(([code]) => code === region)) set("region", `Choose your ${label.toLowerCase()} from the list`);
    } else {
      set("region", text(region, { required, max: 80, missing: `Enter your ${label.toLowerCase()}` }));
    }
  }

  if (country) {
    const code = a.postal.trim();
    const { label, placeholder, pattern, required } = country.postal;
    if (!code) set("postal", required ? `Enter your ${label === "ZIP code" || label === "Eircode" ? label : label.toLowerCase()}` : undefined);
    else if (!pattern.test(code)) set("postal", `${label} should look like ${placeholder}`);
  }

  const phone = (a.phone ?? "").trim();
  if (phone && !PHONE.test(phone)) set("phone", "Enter a valid phone number");
  return errors;
}

/** Trims every field, normalises postcodes and drops empty optional fields. */
export function cleanAddress(a: Address): Address {
  const country = countryFor(a.country);
  const postalUpper = country && ["CA", "GB", "IE", "NL"].includes(country.code);
  const out: Address = {
    firstName: a.firstName.trim(),
    lastName: a.lastName.trim(),
    address1: a.address1.trim(),
    city: a.city.trim(),
    region: country?.region ? a.region.trim() : "",
    postal: postalUpper ? a.postal.trim().toUpperCase() : a.postal.trim(),
    country: a.country,
  };
  const address2 = a.address2?.trim();
  const phone = a.phone?.trim();
  if (address2) out.address2 = address2;
  if (phone) out.phone = phone;
  return out;
}

// ---------------------------------------------------------------------------
// The request body POST /api/checkout accepts
// ---------------------------------------------------------------------------

export const MAX_LINES = 30;
export const MAX_QTY = 99;
const MAX_LAYERS = 80;
const LAYER_TYPES = new Set<Layer["type"]>(["text", "graphic", "image"]);

/** Pricing only needs to know which layers are visible, so the client sends a slim copy of each design. */
export type CheckoutLayer = { id: string; type: Layer["type"]; hidden?: boolean };
export type CheckoutDesign = Record<GarmentView, CheckoutLayer[]>;

export type CheckoutLineInput = Pick<CartLine, "kind" | "slug" | "designId" | "title" | "garment" | "color" | "size" | "qty"> & {
  design: CheckoutDesign;
};

export type CheckoutRequestBody = {
  lines: CheckoutLineInput[];
  email: string;
  address: Address;
  method: ShippingMethodId;
  promo: string | null;
};

export function slimDesign(design: Design): CheckoutDesign {
  const slim = (layers: Layer[]): CheckoutLayer[] =>
    layers.map((l) => (l.hidden ? { id: l.id, type: l.type, hidden: true } : { id: l.id, type: l.type }));
  return { front: slim(design.front), back: slim(design.back) };
}

export function toCheckoutLine(line: CartLine): CheckoutLineInput {
  return {
    kind: line.kind,
    slug: line.slug,
    designId: line.designId,
    title: line.title,
    garment: line.garment,
    color: line.color,
    size: line.size,
    qty: line.qty,
    design: slimDesign(line.design),
  };
}

/** A line as the server prices it. `unitPrice` always comes from the catalog, never from the client. */
export type PricedLine = {
  kind: CartLine["kind"];
  slug?: string;
  designId?: string;
  garment: GarmentId;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  name: string;
  description: string;
  /** Site-relative photo of the piece, when the catalog has one. */
  image?: string;
  backPrint: boolean;
};

export type CheckoutParseResult =
  | { ok: true; body: CheckoutRequestBody; lines: PricedLine[] }
  | { ok: false; error: string; field?: string };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = <T extends object>(obj: T, key: string): key is Extract<keyof T, string> => Object.hasOwn(obj, key);

function parseLayers(v: unknown): CheckoutLayer[] | null {
  if (!Array.isArray(v) || v.length > MAX_LAYERS) return null;
  const out: CheckoutLayer[] = [];
  for (const layer of v) {
    if (!isRecord(layer) || typeof layer.type !== "string" || !LAYER_TYPES.has(layer.type as Layer["type"])) return null;
    if (layer.hidden !== undefined && typeof layer.hidden !== "boolean") return null;
    out.push({ id: typeof layer.id === "string" ? layer.id.slice(0, 64) : "", type: layer.type as Layer["type"], hidden: layer.hidden === true });
  }
  return out;
}

function parseDesign(v: unknown): CheckoutDesign | null {
  if (!isRecord(v)) return null;
  const front = parseLayers(v.front);
  const back = parseLayers(v.back);
  return front && back ? { front, back } : null;
}

/** `hasPrint` only reads `hidden`, which the slim layers keep. */
const printsOn = (design: CheckoutDesign, view: GarmentView) => hasPrint(design as unknown as Design, view);

function priceLine(raw: unknown): { line: CheckoutLineInput; priced: PricedLine } | string {
  if (!isRecord(raw)) return "expected an item";
  const { kind, slug, designId, title, garment, color, size, qty } = raw;
  if (kind !== "product" && kind !== "custom") return "unknown item type";
  if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return `quantity must be a whole number from 1 to ${MAX_QTY}`;
  if (typeof garment !== "string" || !has(GARMENTS, garment)) return "unknown garment";
  const g = GARMENTS[garment];
  if (typeof size !== "string" || !g.sizes.includes(size)) return `the ${g.short.toLowerCase()} doesn't come in that size`;
  if (typeof color !== "string" || !has(COLOR_BY_ID, color)) return "unknown color";
  const design = parseDesign(raw.design);
  if (!design) return "the design is missing or malformed";
  const colorName = colorFor(color).name;

  if (kind === "product") {
    if (typeof slug !== "string" || !has(PRODUCT_BY_SLUG, slug)) return "that piece isn't in the shop anymore";
    const product = PRODUCT_BY_SLUG[slug];
    if (product.garment !== garment) return `${product.title} is printed on a ${GARMENTS[product.garment].short.toLowerCase()}`;
    if (!product.colors.includes(color)) return `${product.title} doesn't come in ${colorName}`;
    const creator = CREATOR_BY_HANDLE[product.creator];
    return {
      line: { kind, slug, title: product.title, garment, color, size, qty, design },
      priced: {
        kind,
        slug,
        garment,
        color,
        size,
        qty,
        unitPrice: product.price,
        name: product.title,
        description: [colorName, size === "One size" ? "One size" : `Size ${size}`, creator ? `by ${creator.name}` : null]
          .filter(Boolean)
          .join(" · "),
        image: product.lifestyle,
        backPrint: hasPrint(product.design, "back"),
      },
    };
  }

  const backPrint = printsOn(design, "back");
  const name = typeof title === "string" && title.trim() ? title.trim().slice(0, 80) : `Custom ${g.short}`;
  const id = typeof designId === "string" && designId ? designId.slice(0, 64) : undefined;
  return {
    line: { kind, designId: id, title: name, garment, color, size, qty, design },
    priced: {
      kind,
      designId: id,
      garment,
      color,
      size,
      qty,
      unitPrice: g.basePrice + (backPrint ? BACK_PRINT_PRICE : 0),
      name,
      description: [`Your design on the ${g.name}`, colorName, size === "One size" ? null : `Size ${size}`, backPrint ? "front + back print" : null]
        .filter(Boolean)
        .join(" · "),
      backPrint,
    },
  };
}

function parseAddress(v: unknown): Address | null {
  if (!isRecord(v)) return null;
  const str = (key: string) => (typeof v[key] === "string" ? (v[key] as string) : "");
  for (const key of ["firstName", "lastName", "address1", "city", "postal", "country"]) {
    if (typeof v[key] !== "string") return null;
  }
  for (const key of ["address2", "region", "phone"]) {
    if (v[key] !== undefined && v[key] !== null && typeof v[key] !== "string") return null;
  }
  return {
    firstName: str("firstName"),
    lastName: str("lastName"),
    address1: str("address1"),
    address2: str("address2"),
    city: str("city"),
    region: str("region"),
    postal: str("postal"),
    country: str("country").trim().toUpperCase(),
    phone: str("phone"),
  };
}

/** Validates an untrusted request body and prices each line from the catalog. */
export function parseCheckoutRequest(input: unknown): CheckoutParseResult {
  const fail = (error: string, field?: string): CheckoutParseResult => ({ ok: false, error, field });
  if (!isRecord(input)) return fail("Expected a JSON object.");

  const { lines, email, address, method, promo } = input;
  if (!Array.isArray(lines) || lines.length === 0) return fail("Your bag is empty.", "lines");
  if (lines.length > MAX_LINES) return fail(`A bag can hold up to ${MAX_LINES} different pieces.`, "lines");

  const parsedLines: CheckoutLineInput[] = [];
  const priced: PricedLine[] = [];
  for (const [i, raw] of lines.entries()) {
    const result = priceLine(raw);
    if (typeof result === "string") return fail(`Item ${i + 1}: ${result}.`, `lines.${i}`);
    parsedLines.push(result.line);
    priced.push(result.priced);
  }

  if (typeof email !== "string") return fail("Enter your email address.", "email");
  const emailError = validateEmail(email);
  if (emailError) return fail(`${emailError}.`, "email");

  const parsedAddress = parseAddress(address);
  if (!parsedAddress) return fail("Enter a shipping address.", "address");
  const addressErrors = validateAddress(parsedAddress);
  const firstBad = ADDRESS_FIELDS.find((f) => addressErrors[f]);
  if (firstBad) return fail(`${addressErrors[firstBad]}.`, `address.${firstBad}`);

  if (typeof method !== "string" || !SHIPPING_METHODS.some((m) => m.id === method)) return fail("Choose a shipping method.", "method");
  if (promo !== undefined && promo !== null && typeof promo !== "string") return fail("Promo code must be text.", "promo");

  return {
    ok: true,
    body: {
      lines: parsedLines,
      email: email.trim(),
      address: cleanAddress(parsedAddress),
      method: method as ShippingMethodId,
      // Unknown codes are ignored rather than rejected, exactly like computeTotals does.
      promo: findPromo(promo as string | null | undefined)?.code ?? null,
    },
    lines: priced,
  };
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export type CheckoutResponse =
  | { mode: "demo"; totals: Totals; unitPrices: number[] }
  | { mode: "stripe"; url: string; orderId: string; totals: Totals; unitPrices: number[] }
  | { error: string; field?: string };
