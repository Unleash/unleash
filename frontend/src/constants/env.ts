// DEV leads because it is a build-time define, so this folds to `false` in a
// build and the toolbar tree-shakes out entirely -- verified for both `vite
// build` and `vite build --mode development`. MODE excludes vitest, and
// import.meta.hot is a runtime backstop for any build that leaves DEV true.
export const IS_DEV =
    import.meta.env.DEV &&
    import.meta.env.MODE !== 'test' &&
    Boolean(import.meta.hot);
