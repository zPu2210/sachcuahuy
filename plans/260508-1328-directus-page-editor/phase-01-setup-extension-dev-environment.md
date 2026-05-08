---
phase: 1
title: "Setup Extension Dev Environment"
status: pending
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Setup Extension Dev Environment

## Overview

Scaffold a Directus Module extension using the Extensions SDK. Set up local dev environment with hot reload against the live CMS.

## Requirements

### Functional
- Extension scaffold with correct Directus SDK version
- Hot reload dev mode connecting to `cms.sachcuahuy.com`
- Basic module renders in Directus sidebar

### Non-functional
- Node.js 18+ (matches Directus container)
- TypeScript for type safety
- Vue 3 Composition API

## Architecture

```
/opt/directus-sachcuahuy/extensions/
└── modules/
    └── page-editor/
        ├── package.json
        ├── src/
        │   └── index.ts      # Module entry
        └── dist/             # Built output
```

**Local dev structure:**
```
sachcuahuy/
└── directus-extensions/
    └── page-editor/
        ├── package.json
        ├── src/
        │   ├── index.ts
        │   └── module.vue
        └── .env              # DIRECTUS_URL for dev
```

## Related Code Files

### Create
- `directus-extensions/page-editor/package.json`
- `directus-extensions/page-editor/src/index.ts`
- `directus-extensions/page-editor/src/module.vue`
- `directus-extensions/page-editor/.env`
- `directus-extensions/page-editor/tsconfig.json`

## Implementation Steps

### 1. Create extension directory
```bash
mkdir -p directus-extensions/page-editor
cd directus-extensions/page-editor
```

### 2. Initialize with Directus SDK
```bash
npx create-directus-extension@latest
# Select: module
# Name: page-editor
# Language: TypeScript
```

Or manually create `package.json`:
```json
{
  "name": "directus-extension-page-editor",
  "version": "1.0.0",
  "type": "module",
  "directus:extension": {
    "type": "module",
    "path": "dist/index.js",
    "source": "src/index.ts",
    "host": "^11.0.0"
  },
  "scripts": {
    "build": "directus-extension build",
    "dev": "directus-extension build -w --no-minify"
  },
  "devDependencies": {
    "@directus/extensions-sdk": "^12.0.0",
    "vue": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### 3. Create module entry `src/index.ts`
```typescript
import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
  id: 'page-editor',
  name: 'Quản Lý Nội Dung',
  icon: 'edit_note',
  routes: [
    {
      path: '',
      component: ModuleComponent,
    },
  ],
});
```

### 4. Create placeholder component `src/module.vue`
```vue
<template>
  <div class="page-editor">
    <h1>Quản Lý Nội Dung</h1>
    <p>Module đang được phát triển...</p>
  </div>
</template>

<script setup lang="ts">
// Phase 2 will add tab logic
</script>

<style scoped>
.page-editor {
  padding: 24px;
}
</style>
```

### 5. Create `.env` for local dev
```env
DIRECTUS_URL=https://cms.sachcuahuy.com
```

### 6. Build and verify
```bash
npm install
npm run build
# Output: dist/index.js
```

### 7. Test locally (optional SSH tunnel)
```bash
# Copy built extension to server for quick test
scp -r dist/ goclaw:/opt/directus-sachcuahuy/extensions/modules/page-editor/
ssh goclaw "cd /opt/directus-sachcuahuy && docker compose restart directus"
```

## Success Criteria

- [ ] `npm run build` succeeds without errors
- [ ] `dist/index.js` generated
- [ ] Module appears in Directus sidebar after deploy
- [ ] Clicking module shows placeholder text "Quản Lý Nội Dung"

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SDK version mismatch | Medium | High | Pin `@directus/extensions-sdk` to match server |
| Hot reload fails | Low | Low | Build + rsync workflow as fallback |
| Module not loading | Medium | Medium | Check Directus logs `docker logs directus-sachcuahuy` |

## Notes

- Directus 11 uses ES modules; ensure `"type": "module"` in package.json
- Extension must be in `/opt/directus-sachcuahuy/extensions/modules/` (not `/directus/extensions/`)
- Container restart required after extension changes
