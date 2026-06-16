// Phantom type for raw Vite asset imports. Not assignable to `string` at
// compile time, so `<img src={icon} />` is a TypeScript error.
// Must go through `formatAssetPath(icon)` which returns `string`.
// At runtime these are plain strings — this is a compile-time-only constraint.
declare const _rawAssetUrlBrand: unique symbol;
type UnformattedAssetPath = { readonly [_rawAssetUrlBrand]: true };

// Override vite/client asset declarations. This file is alphabetically before
// vite-env.d.ts so TypeScript processes it first, making UnformattedAssetPath win over
// vite/client's `string` type for asset imports.
declare module '*.apng' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.bmp' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.png' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.jpg' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.jpeg' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.jfif' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.pjpeg' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.pjp' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.gif' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.svg' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.ico' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.webp' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.avif' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.cur' {
    const src: UnformattedAssetPath;
    export default src;
}
declare module '*.jxl' {
    const src: UnformattedAssetPath;
    export default src;
}
