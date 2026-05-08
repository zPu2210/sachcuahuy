---
phase: 4
title: "Deploy and Test"
status: pending
priority: P1
effort: "2h"
dependencies: [3]
---

# Phase 4: Deploy and Test

## Overview

Deploy the Page Editor module to production Directus on Contabo. Test with Huy's account. Document usage and gather feedback.

## Requirements

### Functional
- Module deployed and accessible at `cms.sachcuahuy.com`
- Huy can access via sidebar
- All 4 tabs functional with real data
- Changes reflect on live website after save

### Non-functional
- Deploy without downtime (restart <30s)
- Module loads <2s
- No console errors

## Architecture

```
Local                           Contabo
┌────────────────┐              ┌────────────────────────────────────┐
│ npm run build  │              │ /opt/directus-sachcuahuy/          │
│ → dist/        │  ──rsync──>  │   extensions/modules/page-editor/  │
└────────────────┘              │     └── dist/index.js              │
                                │                                     │
                                │ docker compose restart directus     │
                                └────────────────────────────────────┘
```

## Related Code Files

### Create (on Contabo)
- `/opt/directus-sachcuahuy/extensions/modules/page-editor/package.json`
- `/opt/directus-sachcuahuy/extensions/modules/page-editor/dist/index.js`

### Modify
- `docs/content-map.md` — add Huy onboarding section

## Implementation Steps

### 1. Final build

```bash
cd directus-extensions/page-editor
npm run build
ls -la dist/
# Expect: index.js (bundled module)
```

### 2. Create extension directory on server

```bash
ssh goclaw "mkdir -p /opt/directus-sachcuahuy/extensions/modules/page-editor"
```

### 3. Deploy via rsync

```bash
rsync -avz --delete \
  directus-extensions/page-editor/dist/ \
  goclaw:/opt/directus-sachcuahuy/extensions/modules/page-editor/dist/

# Also copy package.json (required for Directus to recognize extension)
scp directus-extensions/page-editor/package.json \
  goclaw:/opt/directus-sachcuahuy/extensions/modules/page-editor/
```

### 4. Restart Directus container

```bash
ssh goclaw "cd /opt/directus-sachcuahuy && docker compose restart directus"
```

### 5. Verify extension loaded

```bash
ssh goclaw "docker logs directus-sachcuahuy --tail 30 | grep -i extension"
# Expect: "Loaded extension: page-editor"
```

### 6. Smoke test as admin

1. Open `https://cms.sachcuahuy.com`
2. Login as admin (pu.hungphu@gmail.com)
3. Check sidebar for "Quản Lý Nội Dung" module
4. Click → verify 4 tabs load
5. Edit hero_subtitle → Save → Check live site

### 7. Test as Huy

1. Login as Huy (demtamsutronghuy@gmail.com)
2. Verify module appears in sidebar
3. Test each tab:
   - Trang Chủ: edit hero_subtitle
   - Sách: view list, edit a book
   - Giới Thiệu: edit author_bio
   - Cài Đặt: view bank info (read-only for Huy?)

### 8. Verify cache revalidation

After saving any field, the Directus Flow should trigger cache revalidation:

```bash
# Check Vercel deployment
curl -I https://sachcuahuy.vercel.app/ | grep -i cache
```

Expected: cache should be fresh after ~5s of save.

### 9. Update documentation

Add to `docs/content-map.md`:

```markdown
## Hướng dẫn sử dụng Page Editor

1. Đăng nhập CMS tại `cms.sachcuahuy.com`
2. Click "Quản Lý Nội Dung" ở thanh bên trái
3. Chọn tab muốn sửa:
   - **Trang Chủ**: Sửa tiêu đề, mô tả Hero
   - **Sách**: Xem/sửa thông tin sách
   - **Giới Thiệu**: Sửa tiểu sử tác giả
   - **Cài Đặt**: Xem thông tin bank, ship
4. Nhấn "Lưu thay đổi" sau khi sửa
5. Đợi ~5 giây, refresh trang web để xem thay đổi
```

### 10. Gather feedback from Huy

Questions to ask:
- [ ] Module có dễ tìm không?
- [ ] Tab nào hay dùng nhất?
- [ ] Có field nào thiếu/thừa không?
- [ ] Cần thêm hướng dẫn gì không?

## Success Criteria

- [ ] Module appears in Directus sidebar
- [ ] All 4 tabs load without error
- [ ] HomeForm: edit hero_subtitle → appears on live site
- [ ] BooksForm: edit book price → appears on live site
- [ ] Huy can login and use module independently
- [ ] No console errors in browser
- [ ] Module loads <2s
- [ ] Documentation updated

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Extension not loading | Medium | High | Check logs, verify package.json format |
| Permission denied for Huy | Medium | Medium | Check Directus roles, may need custom module permission |
| Cache not invalidating | Low | Medium | Verify Directus Flow is active |
| Module breaks existing admin | Low | High | Test in staging first if possible |

## Rollback Plan

If module causes issues:

```bash
ssh goclaw "rm -rf /opt/directus-sachcuahuy/extensions/modules/page-editor"
ssh goclaw "cd /opt/directus-sachcuahuy && docker compose restart directus"
```

Directus will continue working with raw collections.

## Post-Deploy Checklist

- [ ] Backup current Directus state before deploy
- [ ] Deploy during low-traffic time (night VN time)
- [ ] Monitor Directus logs for 10 min after deploy
- [ ] Test all 4 tabs with real edits
- [ ] Verify live site reflects changes
- [ ] Send Huy instructions + credentials reminder
- [ ] Schedule follow-up call to gather feedback
