// Phantom type for raw Vite asset imports. Not assignable to `string` at
// compile time, so `<img src={icon} />` is a TypeScript error.
// Must go through `formatAssetPath(icon)` which returns `string`.
// At runtime these are plain strings — this is a compile-time-only constraint.
declare const _rawAssetUrlBrand: unique symbol;
type RawAssetURL = { readonly [_rawAssetUrlBrand]: true };

// Override vite/client asset declarations. This file is alphabetically before
// vite-env.d.ts so TypeScript processes it first, making RawAssetURL win over
// vite/client's `string` type for asset imports.
declare module '*.apng' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.bmp' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.png' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.jpg' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.jpeg' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.jfif' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.pjpeg' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.pjp' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.gif' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.svg' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.ico' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.webp' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.avif' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.cur' {
    const src: RawAssetURL;
    export default src;
}
declare module '*.jxl' {
    const src: RawAssetURL;
    export default src;
}
