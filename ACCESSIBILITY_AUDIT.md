# Accessibility Audit Report
**Application:** kanban-todo
**Audit Date:** February 6, 2026
**WCAG Version:** 2.1

## Summary
- **Total Issues:** 11
- **Critical:** 3 | **Serious:** 4 | **Moderate:** 4
- **Target Level:** AA
- **Automated Coverage:** ~57% (manual testing with screen readers recommended)

---

## Critical Issues (Fix Immediately)

### 1. Non-Keyboard-Accessible Interactive Elements - WCAG 2.1.1
**Severity:** Critical
**Impact:** Keyboard-only users cannot interact with task cards or add new tasks
**Affected:** Task cards, "Add issue" trigger

**Locations:**
- `src/app/page.tsx:169-219` - Task cards use `<div>` with only `onClick`
- `src/app/page.tsx:254-262` - "Add issue" uses `<span>` with only `onClick`

**Problem:**
Interactive elements use div/span with onClick handlers but no keyboard event handlers. Users navigating with Tab/Enter cannot activate these elements.

**Fix for task cards:**
```tsx
// Before (line 169)
<div
  key={task.id}
  draggable
  onDragStart={() => handleDragStart(task, column.id)}
  onClick={() => console.log("open task")}
  className="group bg-[#0a0a0b] ..."
>

// After - Use button or add keyboard support
<div
  key={task.id}
  role="button"
  tabIndex={0}
  draggable
  onDragStart={() => handleDragStart(task, column.id)}
  onClick={() => console.log("open task")}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      console.log("open task");
    }
  }}
  aria-label={`Task: ${task.title}. Priority: ${task.priority || "medium"}. Press Enter to open.`}
  className="group bg-[#0a0a0b] ..."
>
```

**Fix for "Add issue" trigger:**
```tsx
// Before (line 254)
<span onClick={() => setShowInputFor(column.id)} className="...">

// After - Use button element
<button
  onClick={() => setShowInputFor(column.id)}
  className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 
           hover:text-zinc-400 hover:bg-zinc-900/30 rounded-md transition-colors"
>
  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
  </svg>
  Add issue
</button>
```

**Why:** WCAG 2.1.1 requires all functionality to be operable via keyboard interface.

---

### 2. Insufficient Color Contrast - WCAG 1.4.3
**Severity:** Critical
**Impact:** Users with low vision or color blindness cannot read task content
**Affected:** Task titles, task IDs, column counts

**Locations:**
- `src/app/page.tsx:187` - Task title uses `text-zinc-500` on `#0a0a0b` background (~3.5:1)
- `src/app/page.tsx:192` - Task ID uses `text-zinc-700` (~2.3:1)
- `src/app/page.tsx:160-161` - Column task count uses `text-zinc-600` (~3.0:1)

**Problem:**
Text does not meet minimum 4.5:1 contrast ratio for normal text (AA level).

**Fix:**
```tsx
// Before
<p className="text-sm text-zinc-500 leading-snug">

// After - Use text-zinc-300 for ~7:1 contrast
<p className="text-sm text-zinc-300 leading-snug">

// Before
<span className="text-[9px] text-zinc-700 font-mono">

// After - Use text-zinc-400 and larger font
<span className="text-[10px] text-zinc-400 font-mono">

// Column count - Before
<span className="text-xs text-zinc-600">

// After
<span className="text-xs text-zinc-400">
```

**Why:** WCAG 1.4.3 requires 4.5:1 contrast for normal text and 3:1 for large text.

---

### 3. Missing Accessible Name on Delete Button - WCAG 4.1.2
**Severity:** Critical
**Impact:** Screen reader users cannot identify the purpose of the delete button
**Affected:** 1 button per task

**Location:**
- `src/app/page.tsx:199-217`

**Problem:**
Delete button contains only an SVG icon with no accessible name. Screen readers announce it as "button" with no context.

**Fix:**
```tsx
// Before
<button
  onClick={() => deleteTask(column.id, task.id)}
  className="text-zinc-600 hover:text-zinc-400 ..."
>
  <svg className="w-3.5 h-3.5" ...>

// After - Add aria-label and hide decorative SVG
<button
  onClick={(e) => {
    e.stopPropagation();
    deleteTask(column.id, task.id);
  }}
  aria-label={`Delete task: ${task.title}`}
  className="text-zinc-600 hover:text-zinc-400 ..."
>
  <svg aria-hidden="true" className="w-3.5 h-3.5" ...>
```

**Why:** WCAG 4.1.2 requires all UI components to have an accessible name.

---

## Serious Issues (Fix Before Launch)

### 4. Missing Form Label - WCAG 1.3.1, 3.3.2
**Severity:** Serious
**Impact:** Screen reader users don't know the purpose of the input field
**Affected:** Task input field (4 columns)

**Location:**
- `src/app/page.tsx:226-250`

**Problem:**
Input uses placeholder as the only description. Placeholders are not reliable labels.

**Fix:**
```tsx
// Before
<input
  type="text"
  autoFocus
  placeholder="Issue title"
  ...
/>

// After - Add visually hidden label
<div className="mt-1">
  <label htmlFor={`new-task-${column.id}`} className="sr-only">
    New task title for {column.title} column
  </label>
  <input
    id={`new-task-${column.id}`}
    type="text"
    autoFocus
    placeholder="Issue title"
    aria-describedby={`hint-${column.id}`}
    ...
  />
  <span id={`hint-${column.id}`} className="sr-only">
    Press Enter to add task, Escape to cancel
  </span>
</div>
```

Add this utility class to `globals.css`:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Why:** WCAG 3.3.2 requires labels for user input. Placeholders disappear on input and aren't announced by all screen readers.

---

### 5. Color-Only Priority Indicator - WCAG 1.4.1
**Severity:** Serious
**Impact:** Color-blind users cannot distinguish priority levels
**Affected:** Priority dots on all tasks

**Location:**
- `src/app/page.tsx:180-182`

**Problem:**
Priority is communicated only through color (orange, amber, blue, gray dots).

**Fix:**
```tsx
// Before
<div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority || "medium"]}`} />

// After - Add text alternative
<div className="flex items-center gap-1.5 mt-1.5 flex-shrink-0">
  <div
    className={`w-1 h-1 rounded-full ${priorityColors[task.priority || "medium"]}`}
    aria-hidden="true"
  />
  <span className="sr-only">
    Priority: {task.priority || "medium"}
  </span>
</div>
```

**Why:** WCAG 1.4.1 prohibits using color as the only means of conveying information.

---

### 6. Poor Semantic Structure - WCAG 1.3.1, 2.4.6
**Severity:** Serious
**Impact:** Screen reader users cannot navigate by headings; structure is unclear
**Affected:** Page structure, column headers

**Locations:**
- `src/app/page.tsx:137` - Main title uses `<h1>` (good)
- `src/app/page.tsx:156-158` - Column titles use `<div>` instead of headings

**Problem:**
Column titles are not semantic headings. Users cannot navigate between columns using heading shortcuts.

**Fix:**
```tsx
// Before (line 156)
<div className="text-sm font-medium text-zinc-300">
  {column.title}
</div>

// After - Use h2 for column headers
<h2 className="text-sm font-medium text-zinc-300" id={`column-${column.id}`}>
  {column.title}
</h2>
```

Also add `aria-labelledby` to the column container:
```tsx
<div
  key={column.id}
  className="flex-shrink-0 w-72"
  role="region"
  aria-labelledby={`column-${column.id}`}
  ...
>
```

**Why:** WCAG 1.3.1 requires programmatic structure. WCAG 2.4.6 requires descriptive headings.

---

### 7. Missing Context for Task Count - WCAG 1.3.1
**Severity:** Serious
**Impact:** Screen reader users hear a number without context
**Affected:** Task count display per column

**Location:**
- `src/app/page.tsx:160-162`

**Problem:**
Screen readers announce just the number without context (e.g., "3" instead of "3 tasks").

**Fix:**
```tsx
// Before
<span className="text-xs text-zinc-600">
  {column.tasks.length}
</span>

// After - Add context for screen readers
<span className="text-xs text-zinc-400" aria-label={`${column.tasks.length} ${column.tasks.length === 1 ? 'task' : 'tasks'}`}>
  <span aria-hidden="true">{column.tasks.length}</span>
</span>
```

**Why:** Numbers need context to be meaningful to assistive technology users.

---

## Moderate Issues (Fix Soon)

### 8. Missing Landmark Regions - WCAG 1.3.1
**Severity:** Moderate
**Impact:** Users cannot navigate efficiently using landmark shortcuts
**Affected:** Page layout

**Location:**
- `src/app/page.tsx:130-269`

**Fix:**
```tsx
// Add header landmark for the title area
<header className="max-w-7xl mx-auto mb-6">
  ...
</header>

// The main element already exists (good!)
// Add role="main" for older assistive tech if needed
<main className="min-h-screen bg-[#0a0a0b] p-6 font-sans">
```

---

### 9. Decorative SVG Not Hidden - WCAG 1.1.1
**Severity:** Moderate
**Impact:** Screen readers may announce meaningless content
**Affected:** Plus icon in "Add issue" button

**Location:**
- `src/app/page.tsx:260`

**Problem:**
Inline SVG data URI image doesn't have `aria-hidden` to hide from assistive tech.

**Fix:**
```tsx
// Before - img element with data URI
<img src="data:image/svg+xml,..." alt="" />

// After - Use inline SVG with aria-hidden
<svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
</svg>
```

---

### 10. No Skip Link - WCAG 2.4.1
**Severity:** Moderate
**Impact:** Keyboard users must tab through header on every page load

**Problem:**
No skip link to bypass repeated navigation content.

**Fix:** Add skip link at the top of the body:
```tsx
<main className="min-h-screen bg-[#0a0a0b] p-6 font-sans">
  <a href="#board" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-violet-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:z-50">
    Skip to board
  </a>
  
  {/* Header */}
  <div className="max-w-7xl mx-auto mb-6">...</div>

  {/* Board */}
  <div id="board" tabIndex={-1} className="max-w-7xl mx-auto">...</div>
</main>
```

---

### 11. Missing Reduced Motion Support - WCAG 2.3.3
**Severity:** Moderate
**Impact:** Users with vestibular disorders may experience discomfort

**Location:**
- `src/app/globals.css` - No `prefers-reduced-motion` media query

**Fix:** Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Recommendations

### Automated Testing
1. **Install jsx-a11y ESLint plugin** - Already added to devDependencies, configure in `eslint.config.mjs`:
```js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // ... existing config
  jsxA11y.flatConfigs.recommended,
];
```

2. **Add @axe-core/react for runtime testing:**
```bash
npm install @axe-core/react --save-dev
```

### Manual Testing Checklist
- [ ] Tab through entire interface - verify all interactive elements are reachable
- [ ] Press Enter/Space on task cards and buttons
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Zoom to 200% and verify layout doesn't break
- [ ] Enable high contrast mode in OS settings
- [ ] Enable "Reduce motion" and verify no jarring animations

### Screen Reader Testing Commands (VoiceOver)
- **VO + U**: Open rotor to navigate by headings, landmarks, links
- **VO + Command + H**: Navigate by headings
- **Tab**: Move between interactive elements
- **VO + Space**: Activate focused element

---

## Next Steps (Prioritized)

1. **Immediate (this sprint):**
   - Fix keyboard accessibility on task cards and "Add issue" buttons
   - Add accessible names to delete buttons
   - Improve color contrast on task text

2. **Short-term (next sprint):**
   - Add form labels
   - Add non-color priority indicators
   - Fix semantic heading structure

3. **Medium-term:**
   - Add skip links
   - Add reduced motion support
   - Add landmark regions
   - Set up automated a11y testing in CI

---

## Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
