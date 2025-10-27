# Resume Column & Page Overflow Guide

## How FlowCV and Professional Resume Builders Handle Overflow

## Table of Contents

1. [Overview: How FlowCV Handles Overflow](#overview-how-flowcv-handles-overflow)
2. [Column Overflow in Two-Column Layouts](#column-overflow-in-two-column-layouts)
3. [Page Overflow to Next Page](#page-overflow-to-next-page)
4. [The Complete Flow System](#the-complete-flow-system)
5. [CSS Properties Reference](#css-properties-reference)
6. [Implementation Strategies](#implementation-strategies)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Overview: How FlowCV Handles Overflow

### The Three-Stage Overflow System

FlowCV and similar resume builders use a **hierarchical overflow system**:

```
Stage 1: Content fills LEFT COLUMN
   ↓ (when column height limit reached)
Stage 2: Overflow goes to RIGHT COLUMN
   ↓ (when both columns filled)
Stage 3: Overflow creates NEW PAGE
   ↓ (repeat: new page also has 2 columns)
```

### Visual Flow Diagram

```
PAGE 1 (297mm A4 height)
┌──────────────┬──────────────┐
│ Left Col     │ Right Col    │
│ Section 1 ✓  │ Section 4 ✓  │
│ Section 2 ✓  │ Section 5 ✓  │
│ Section 3 ✓  │ Section 6 ⚠  │  ← Section 6 is too long!
│              │ (partial)    │
│ [FULL]       │ [OVERFLOW]   │
└──────────────┴──────────────┘
              ↓
              Triggers Page 2

PAGE 2 (new 297mm A4 height)
┌──────────────┬──────────────┐
│ Section 6    │              │  ← Continues from page 1
│ (continued)  │              │
│ Section 7 ✓  │              │
└──────────────┴──────────────┘
```

---

## Column Overflow in Two-Column Layouts

### How CSS Multi-Column Creates Overflow

When you use `column-count: 2`, the browser:

1. **Calculates available height** in the container
2. **Fills the first column** from top to bottom
3. **Automatically overflows** to the second column
4. **Continues the flow** naturally

### The Magic CSS

```css
.resume-container {
  /* Critical properties for column overflow */
  column-count: 2; /* Create 2 columns */
  column-gap: 20mm; /* Space between columns */
  column-fill: auto; /* Sequential fill (not balanced) */

  /* Define boundaries */
  width: 210mm; /* A4 width */
  min-height: 297mm; /* A4 height (can grow) */
  max-height: 297mm; /* Lock height for page overflow */
}
```

### Column Fill: Auto vs Balance

#### `column-fill: auto` (FlowCV uses this)

**Sequential filling** - fills left column completely before moving to right.

```
Height: 100px
┌──────────┬──────────┐
│ Content1 │          │  ← Left fills first
│ Content2 │          │
│ Content3 │          │
│ Content4 │          │
│ Content5 │ Content6 │  ← Overflow to right
│          │ Content7 │
└──────────┴──────────┘
```

**Code:**

```css
.resume-container {
  column-fill: auto; /* Sequential flow */
  height: 297mm; /* Fixed height forces overflow */
}
```

#### `column-fill: balance` (Not typically used for resumes)

**Balanced distribution** - distributes content evenly.

```
Height: 100px
┌──────────┬──────────┐
│ Content1 │ Content4 │  ← Evenly distributed
│ Content2 │ Content5 │
│ Content3 │ Content6 │
│          │ Content7 │  ← Right may have more
└──────────┴──────────┘
```

### Real Example: Experience Section Overflowing

```html
<div class="resume-page">
  <section class="resume-section">
    <h2>Experience</h2>

    <!-- Item 1 - Fits in left column -->
    <div class="experience-item">
      <h3>Senior Developer</h3>
      <p>Tech Corp | 2020-Present</p>
      <ul>
        <li>Achievement 1</li>
        <li>Achievement 2</li>
      </ul>
    </div>

    <!-- Item 2 - Fits in left column -->
    <div class="experience-item">
      <h3>Mid-Level Developer</h3>
      <p>StartUp Inc | 2018-2020</p>
      <ul>
        <li>Achievement 1</li>
        <li>Achievement 2</li>
      </ul>
    </div>

    <!-- Item 3 - OVERFLOWS to right column -->
    <div class="experience-item">
      <h3>Junior Developer</h3>
      <p>Agency | 2016-2018</p>
      <ul>
        <li>Achievement 1</li>
        <li>Achievement 2</li>
      </ul>
    </div>
  </section>
</div>
```

**Result:**

```
┌─────────────────┬─────────────────┐
│ Experience      │                 │
│                 │                 │
│ Senior Dev      │ Junior Dev      │  ← Item 3 overflowed
│ - Achievement 1 │ - Achievement 1 │    to right column
│ - Achievement 2 │ - Achievement 2 │
│                 │                 │
│ Mid-Level Dev   │                 │
│ - Achievement 1 │                 │
│ - Achievement 2 │                 │
└─────────────────┴─────────────────┘
```

### Preventing Unwanted Column Breaks

Use `break-inside: avoid` to keep items together:

```css
.experience-item {
  break-inside: avoid; /* Standard */
  -webkit-column-break-inside: avoid; /* Chrome, Safari */
  page-break-inside: avoid; /* Firefox */
}
```

**Without `break-inside: avoid`:**

```
BAD ❌
┌─────────────────┬─────────────────┐
│ Senior Dev      │ - Achievement 2 │  ← Item split!
│ - Achievement 1 │                 │
└─────────────────┴─────────────────┘
```

**With `break-inside: avoid`:**

```
GOOD ✓
┌─────────────────┬─────────────────┐
│ Senior Dev      │                 │
│ - Achievement 1 │ Mid-Level Dev   │  ← Item moves as unit
│ - Achievement 2 │ - Achievement 1 │
│                 │ - Achievement 2 │
└─────────────────┴─────────────────┘
```

---

## Page Overflow to Next Page

### How FlowCV Creates Multiple Pages

When content exceeds the page height (297mm for A4), FlowCV uses:

1. **Fixed height containers** - Each page has exact height
2. **Page break properties** - Force new pages
3. **Puppeteer/Browser rendering** - Automatically creates PDF pages

### Method 1: Multiple Page Containers (Recommended)

This is what FlowCV likely uses - **pre-defined page containers**.

```html
<!-- Page 1 -->
<div class="resume-page" id="page-1">
  <header class="resume-header">
    <h1>John Doe</h1>
  </header>
  <section class="resume-section">
    <!-- Content for page 1 -->
  </section>
</div>

<!-- Page 2 (created dynamically if needed) -->
<div class="resume-page" id="page-2">
  <section class="resume-section">
    <!-- Overflow content from page 1 -->
  </section>
</div>
```

**CSS:**

```css
.resume-page {
  width: 210mm;
  height: 297mm; /* Fixed height - CRITICAL */
  overflow: hidden; /* Clips overflow */

  /* Two columns per page */
  column-count: 2;
  column-gap: 20mm;
  column-fill: auto;

  /* Page break after each page */
  page-break-after: always;

  /* Spacing between pages in preview */
  margin-bottom: 20px;
}

/* Last page shouldn't force break */
.resume-page:last-child {
  page-break-after: auto;
}
```

### Method 2: Single Container with Auto-Pagination

Let browser handle pagination naturally:

```css
.resume-container {
  width: 210mm;
  /* No fixed height - grows naturally */
  min-height: 297mm;

  column-count: 2;
  column-gap: 20mm;
  column-fill: auto;
}

/* In print/PDF, browser creates pages automatically */
@media print {
  .resume-container {
    /* Browser handles pagination at 297mm intervals */
  }
}
```

### Visual Example: Page Overflow

```
SCENARIO: 5 sections, each 80mm tall

PAGE 1 (297mm available)
┌──────────────┬──────────────┐
│ Section 1    │ Section 3    │
│ (80mm)       │ (80mm)       │
│              │              │
│ Section 2    │ Section 4    │
│ (80mm)       │ (80mm)       │  ← Total: 240mm used
│              │              │
│              │ Section 5    │
│              │ (80mm)       │  ← Starts here...
└──────────────┴──────────────┘
                ↓ (overflow)

PAGE 2 (297mm available)
┌──────────────┬──────────────┐
│ Section 5    │              │  ← ...continues here
│ (continued)  │              │
│ (40mm left)  │              │
└──────────────┴──────────────┘
```

### Dynamic Page Creation (JavaScript)

FlowCV likely uses JavaScript to dynamically create pages:

```javascript
function calculatePages(resumeElement) {
  const pageHeight = 297; // mm
  const contentHeight = resumeElement.scrollHeight; // in mm
  const pagesNeeded = Math.ceil(contentHeight / pageHeight);

  // Create additional page containers if needed
  for (let i = 2; i <= pagesNeeded; i++) {
    const newPage = document.createElement("div");
    newPage.className = "resume-page";
    newPage.id = `page-${i}`;
    resumeContainer.appendChild(newPage);
  }
}
```

---

## The Complete Flow System

### How Everything Works Together

```
USER ADDS CONTENT
       ↓
┌──────────────────────────────────┐
│  1. Content enters container     │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  2. Flows into LEFT COLUMN       │
│     (column-fill: auto)          │
└──────────────────────────────────┘
       ↓
    Height > Column Height?
       ↓ YES
┌──────────────────────────────────┐
│  3. Overflows to RIGHT COLUMN    │
│     (automatic CSS behavior)     │
└──────────────────────────────────┘
       ↓
    Height > Page Height (297mm)?
       ↓ YES
┌──────────────────────────────────┐
│  4. Creates NEW PAGE              │
│     (page-break-after: always)   │
└──────────────────────────────────┘
       ↓
    Repeat: New page has 2 columns
```

### Complete Working Example

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Page container */
      .resume-page {
        width: 210mm;
        height: 297mm;
        margin: 0 auto 20px;
        padding: 15mm;
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        /* Two-column layout */
        column-count: 2;
        column-gap: 20mm;
        column-fill: auto;

        /* Page break */
        page-break-after: always;
      }

      .resume-page:last-child {
        page-break-after: auto;
      }

      /* Header spans both columns */
      .resume-header {
        column-span: all;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #ddd;
      }

      /* Keep sections together */
      .resume-section {
        break-inside: avoid;
        margin-bottom: 20px;
      }

      /* Keep items together */
      .resume-item {
        break-inside: avoid;
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #eee;
      }

      /* Headings stay with content */
      h2,
      h3 {
        break-after: avoid;
      }

      @media print {
        .resume-page {
          margin: 0;
          box-shadow: none;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  </head>
  <body>
    <!-- PAGE 1 -->
    <div class="resume-page">
      <header class="resume-header">
        <h1>John Doe</h1>
        <p>Software Engineer</p>
      </header>

      <!-- Content flows into 2 columns automatically -->
      <section class="resume-section">
        <h2>Experience</h2>
        <div class="resume-item">
          <h3>Senior Developer</h3>
          <p>Tech Corp | 2020-Present</p>
          <ul>
            <li>Led team of 5 developers</li>
            <li>Improved performance by 40%</li>
          </ul>
        </div>
        <!-- More items... -->
      </section>

      <section class="resume-section">
        <h2>Education</h2>
        <div class="resume-item">
          <h3>BS Computer Science</h3>
          <p>University | 2018</p>
        </div>
      </section>
    </div>

    <!-- PAGE 2 (if content overflows) -->
    <div class="resume-page">
      <section class="resume-section">
        <h2>Projects</h2>
        <!-- Continued content... -->
      </section>
    </div>
  </body>
</html>
```

---

## CSS Properties Reference

### Column Control Properties

| Property       | Values               | Purpose               | Effect on Overflow                                                        |
| -------------- | -------------------- | --------------------- | ------------------------------------------------------------------------- |
| `column-count` | `1`, `2`, `3`, etc.  | Number of columns     | Determines how many columns content can overflow into                     |
| `column-width` | `auto`, `<length>`   | Width of each column  | Browser calculates column count                                           |
| `column-gap`   | `normal`, `<length>` | Space between columns | Doesn't affect overflow, just spacing                                     |
| `column-fill`  | `auto`, `balance`    | How to fill columns   | **auto**: sequential (FlowCV uses this)<br>**balance**: even distribution |
| `column-span`  | `none`, `all`        | Span across columns   | Elements with `all` ignore column flow                                    |

### Break Control Properties

| Property            | Values                                        | Purpose                         | Use Case                   |
| ------------------- | --------------------------------------------- | ------------------------------- | -------------------------- |
| `break-inside`      | `auto`, `avoid`, `avoid-page`, `avoid-column` | Control breaking inside element | Keep resume items together |
| `break-before`      | `auto`, `column`, `page`, `avoid`             | Force/prevent break before      | Start new column/page      |
| `break-after`       | `auto`, `column`, `page`, `avoid`             | Force/prevent break after       | End section on new column  |
| `page-break-inside` | `auto`, `avoid`                               | Legacy page break control       | Firefox compatibility      |
| `page-break-before` | `auto`, `always`, `avoid`                     | Legacy page break               | Force new page             |
| `page-break-after`  | `auto`, `always`, `avoid`                     | Legacy page break               | End page                   |

### Browser Compatibility (Legacy Support)

```css
.element {
  /* Modern standard (2023+) */
  break-inside: avoid;

  /* Webkit: Chrome, Safari, Edge */
  -webkit-column-break-inside: avoid;

  /* Legacy: Firefox, older browsers */
  page-break-inside: avoid;
}
```

---

## Implementation Strategies

### Strategy 1: Fixed Pages (FlowCV Method)

**Pros:**

- ✅ Precise control over pagination
- ✅ Can preview exact pages before export
- ✅ Can add page numbers, headers per page
- ✅ Users see exactly what they'll get

**Cons:**

- ❌ Need JavaScript to detect overflow
- ❌ More complex implementation

```javascript
// Detect when content overflows page
function detectOverflow() {
  const page = document.querySelector(".resume-page");
  const pageHeight = 297 * 3.7795275591; // mm to px

  if (page.scrollHeight > pageHeight) {
    createNewPage();
  }
}

function createNewPage() {
  const newPage = document.createElement("div");
  newPage.className = "resume-page";
  document.getElementById("resume-container").appendChild(newPage);
}

// Monitor content changes
const observer = new MutationObserver(detectOverflow);
observer.observe(document.getElementById("resume-container"), {
  childList: true,
  subtree: true,
  characterData: true,
});
```

### Strategy 2: Natural Flow (Browser Handles It)

**Pros:**

- ✅ Simple implementation
- ✅ Browser handles everything automatically
- ✅ Works perfectly with Puppeteer

**Cons:**

- ❌ Less control over page breaks
- ❌ Can't preview exact pages in browser

```css
.resume-container {
  width: 210mm;
  column-count: 2;
  column-gap: 20mm;
  column-fill: auto;
  /* No height limit - grows naturally */
}

@media print {
  /* Browser creates pages at 297mm intervals */
  @page {
    size: A4;
    margin: 0;
  }
}
```

### Strategy 3: Hybrid Approach

Combine both for best results:

```javascript
// Use natural flow, but monitor for UI feedback
function updatePageCount() {
  const container = document.querySelector(".resume-container");
  const contentHeight = container.scrollHeight;
  const pageHeight = 297 * 3.7795275591; // mm to px
  const pageCount = Math.ceil(contentHeight / pageHeight);

  // Show page count to user
  document.getElementById("page-count").textContent = `${pageCount} page${
    pageCount > 1 ? "s" : ""
  }`;
}
```

---

## Common Patterns

### Pattern 1: Full-Width Header

```css
.resume-header {
  column-span: all; /* Spans both columns */
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ddd;
}
```

```
┌─────────────────────────────────┐
│     John Doe - Header           │  ← Full width
│     john@email.com              │
├──────────────────┬──────────────┤
│ Left Column      │ Right Column │  ← 2 columns resume
└──────────────────┴──────────────┘
```

### Pattern 2: Sidebar + Main Content

Some resumes use grid instead of columns:

```css
.resume-layout {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 20mm;
  width: 210mm;
  min-height: 297mm;
}

.sidebar {
  /* Fixed width sidebar */
  background: #f5f5f5;
}

.main-content {
  /* Main content area */
  /* Can optionally have its own columns */
  column-count: 1;
}
```

```
┌────────┬──────────────────────┐
│        │                      │
│ Side   │  Main Content        │
│ bar    │  (could be 1-2 cols) │
│        │                      │
│ Skills │  Experience          │
│ Langs  │  Education           │
│        │                      │
└────────┴──────────────────────┘
  35%           65%
```

### Pattern 3: Three-Column Skills Section

```css
.skills-section {
  column-count: 3;
  column-gap: 10mm;
  column-fill: balance; /* Even distribution for skills */
}
```

```
┌────────┬────────┬────────┐
│ React  │ Python │ AWS    │
│ Vue.js │ Django │ Docker │
│ Angular│ Flask  │ K8s    │
└────────┴────────┴────────┘
```

### Pattern 4: Force Section to New Column

```css
.start-new-column {
  break-before: column;
}
```

```html
<section class="resume-section">
  <h2>Experience</h2>
  <!-- Content... -->
</section>

<section class="resume-section start-new-column">
  <h2>Education</h2>
  <!-- Forced to new column -->
  <!-- Content... -->
</section>
```

---

## Troubleshooting

### Issue 1: Content Not Overflowing to Second Column

**Symptom:** All content stays in left column, right column empty.

**Causes & Solutions:**

```css
/* PROBLEM: Container has no height constraint */
.resume-container {
  column-count: 2;
  /* Missing: height or min-height */
}

/* SOLUTION: Add height constraint */
.resume-container {
  column-count: 2;
  min-height: 297mm; /* Add this */
  column-fill: auto; /* Sequential fill */
}
```

### Issue 2: Items Breaking Across Columns

**Symptom:** Resume items split between columns.

**Solution:**

```css
/* Add to ALL items that should stay together */
.resume-item,
.experience-item,
.education-item {
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
}
```

### Issue 3: Too Much White Space in Columns

**Symptom:** Large gaps in columns due to avoided breaks.

**Solution:**

```css
/* Don't use break-inside: avoid on large sections */
.large-section {
  /* Let it break naturally */
  break-inside: auto;
}

/* Only avoid breaks on small items */
.small-item {
  break-inside: avoid;
}
```

### Issue 4: Page Not Creating Multiple Pages

**Symptom:** Content overflows off page instead of creating new page.

**Solution:**

```css
/* Ensure page break is set */
.resume-page {
  height: 297mm;  /* Fixed height */
  page-break-after: always;  /* Force new page */
}

/* In Puppeteer, ensure proper settings */
await page.pdf({
  format: 'A4',
  printBackground: true,
  /* Puppeteer handles multi-page automatically */
});
```

### Issue 5: Columns Not Equal Width

**Symptom:** One column wider than the other.

**Solution:**

```css
.resume-container {
  column-count: 2; /* Use count, not width */
  column-gap: 20mm; /* Fixed gap */

  /* Don't use column-width - it's flexible */
  /* column-width: 85mm;  ❌ Remove this */
}
```

### Issue 6: Content Disappearing

**Symptom:** Some content doesn't show up.

**Cause:** `overflow: hidden` on page with no pagination.

**Solution:**

```css
/* Remove overflow: hidden if not using fixed pages */
.resume-container {
  /* overflow: hidden;  ❌ Remove this */
  /* Let content flow naturally */
}

/* OR: Add proper pagination */
.resume-page {
  height: 297mm;
  overflow: hidden; /* OK with fixed height */
  page-break-after: always; /* Must have this */
}
```

---

## Testing Your Implementation

### Test Checklist

```markdown
□ Content flows left to right in two columns
□ Content overflows to second column at correct height
□ Items don't break across columns (experience, education)
□ Headings stay with their content
□ Full-width header spans both columns
□ Multiple pages create correctly when content exceeds 297mm
□ PDF export matches browser preview exactly
□ Print preview shows correct pagination
□ No unexpected white space
□ All content is visible (nothing clipped)
```

### Test Content Scenarios

1. **Short resume** (fits on one page, both columns)
2. **Medium resume** (uses both columns fully)
3. **Long resume** (needs 2+ pages)
4. **Very long items** (experience with many bullets)
5. **Mixed content** (text, lists, badges, etc.)

---

## Performance Considerations

### Large Resumes

For resumes with lots of content:

```css
/* Use will-change for smoother rendering */
.resume-container {
  will-change: transform;
}

/* Use contain for better performance */
.resume-section {
  contain: layout style;
}
```

### Virtual Scrolling (Advanced)

For resume builders with many templates:

```javascript
// Only render visible pages in preview
function renderVisiblePages() {
  const pages = document.querySelectorAll(".resume-page");
  const viewport = window.innerHeight;

  pages.forEach((page) => {
    const rect = page.getBoundingClientRect();
    const isVisible = rect.top < viewport && rect.bottom > 0;

    if (isVisible) {
      page.style.display = "block";
    } else {
      page.style.display = "none"; // Hide off-screen pages
    }
  });
}

window.addEventListener("scroll", renderVisiblePages);
```

---

## Summary: The Complete Overflow Flow

```
┌─────────────────────────────────────────────┐
│ 1. USER ADDS CONTENT                        │
│    (typing in resume builder)               │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 2. CONTENT ENTERS CONTAINER                 │
│    <div class="resume-page">                │
│    column-count: 2                          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 3. FILLS LEFT COLUMN                        │
│    (top to bottom)                          │
│    until height limit reached               │
└────────────────┬────────────────────────────┘
                 ↓
            Column Full?
                 ↓ YES
┌─────────────────────────────────────────────┐
│ 4. OVERFLOWS TO RIGHT COLUMN                │
│    (automatic CSS behavior)                 │
│    column-fill: auto                        │
└────────────────┬────────────────────────────┘
                 ↓
         Both Columns Full?
                 ↓ YES
┌─────────────────────────────────────────────┐
│ 5. PAGE HEIGHT EXCEEDED (297mm)             │
│    Triggers page break                      │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ 6. CREATE NEW PAGE                          │
│    page-break-after: always                 │
│    New page also has 2 columns              │
└────────────────┬────────────────────────────┘
                 ↓
         Repeat: Steps 3-6
                 ↓
┌─────────────────────────────────────────────┐
│ 7. PUPPETEER PDF EXPORT                     │
│    - Renders all pages                      │
│    - Creates multi-page PDF                 │
│    - Preserves all styling                  │
│    - Text remains selectable                │
└─────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Column overflow** uses `column-count: 2` with `column-fill: auto`
2. **Page overflow** uses fixed height (297mm) with `page-break-after: always`
3. **Prevent breaking** with `break-inside: avoid` on items
4. **Puppeteer automatically** creates multi-page PDFs
5. **Test thoroughly** with different content lengths
6. **FlowCV likely uses** fixed page containers with JavaScript detection

---

## Resources

- [MDN: CSS Multi-column Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Columns)
- [MDN: CSS Fragmentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fragmentation)
- [W3C: Paged Media](https://www.w3.org/TR/css-page-3/)
- [Puppeteer PDF Options](https://pptr.dev/api/puppeteer.pdfoptions)

---

**Last Updated:** 2025-10-27  
**Version:** 2.0 - Complete FlowCV overflow system documentation
