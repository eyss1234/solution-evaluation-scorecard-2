/**
 * Join conditional class names into a single string, dropping falsy values.
 *
 * A tiny dependency-free alternative to `clsx` for composing Tailwind classes.
 */
export type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
