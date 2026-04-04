// These module declarations provide minimal typings for Vite and its
// React plugin so that TypeScript can compile configuration files
// without having the actual packages installed in this environment.

declare module 'vite' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
    const plugin: () => unknown;
    export default plugin;
}