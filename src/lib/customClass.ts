/**
 * Support for the `custom_class` field that every slice model exposes.
 *
 * Editors can type one or more space-separated class names into a slice's
 * "Custom CSS Class" field; each slice adds them to its outermost element
 * via `withCustomClass`. When the field is empty (or missing on content
 * created before it existed) the slice's className is returned untouched,
 * so the rendered markup is exactly what it was before.
 */

/**
 * A single CSS class identifier that is usable in a selector without
 * escaping. Tokens that don't match (stray punctuation, quotes, etc.)
 * are dropped instead of being rendered.
 */
const CLASS_TOKEN = /^-?[A-Za-z_][\w-]*$/;
const MAX_TOKEN_LENGTH = 64;

/** Any slice — generated or hand-typed — whose primary may hold `custom_class`. */
type SliceLike = { primary?: object | null };

/** Splits, validates and de-duplicates a space-separated class list. */
export const sanitizeClassNames = (value: string | null | undefined): string => {
	if (!value) {
		return "";
	}

	const tokens = value
		.split(/\s+/)
		.filter(
			(token) => token.length <= MAX_TOKEN_LENGTH && CLASS_TOKEN.test(token),
		);

	return Array.from(new Set(tokens)).join(" ");
};

/**
 * The sanitized custom classes of a slice, or "" when unset. TextWithImage
 * predates `custom_class` and stores the same thing in `custom_css_class`
 * (used by the About page), so both are read.
 */
export const getCustomClass = (slice: SliceLike): string => {
	const primary = slice.primary as
		| { custom_class?: unknown; custom_css_class?: unknown }
		| null
		| undefined;

	const values = [primary?.custom_class, primary?.custom_css_class].filter(
		(value): value is string => typeof value === "string",
	);

	return sanitizeClassNames(values.join(" "));
};

/**
 * Appends a slice's custom classes to its existing className.
 * Returns `className` unchanged when the slice has no custom class.
 */
export function withCustomClass(className: string, slice: SliceLike): string;
export function withCustomClass(
	className: string | undefined,
	slice: SliceLike,
): string | undefined;
export function withCustomClass(
	className: string | undefined,
	slice: SliceLike,
): string | undefined {
	const customClass = getCustomClass(slice);

	if (!customClass) {
		return className;
	}

	return className ? `${className} ${customClass}` : customClass;
}
