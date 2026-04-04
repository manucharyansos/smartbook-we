# Build notes

This project intentionally excludes `node_modules` and `dist` from the deliverable zip.

Recommended commands:

```bash
npm install
npm run build
```

`npm run build` uses direct Node entrypoints for TypeScript and Vite to avoid broken `.bin` wrappers in copied/archived environments.
