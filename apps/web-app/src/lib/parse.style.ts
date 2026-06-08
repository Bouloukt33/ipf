import type { CSSProperties } from "react";

/**
 * Converts a raw CSS inline string (e.g. "background:linear-gradient(90deg,red,blue)")
 * into a React CSSProperties object safe to pass to `style={}`.
 */
export function parseStyle(raw?: string): CSSProperties {
    if (!raw) return {};

    return raw.split(";").reduce<CSSProperties>((acc, declaration) => {
        const colonIdx = declaration.indexOf(":");
        if (colonIdx === -1) return acc;

        const prop = declaration.slice(0, colonIdx).trim();
        const value = declaration.slice(colonIdx + 1).trim();
        if (!prop || !value) return acc;

        // Convert kebab-case to camelCase (e.g. background-color → backgroundColor)
        const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        return { ...acc, [camel]: value };
    }, {});
}