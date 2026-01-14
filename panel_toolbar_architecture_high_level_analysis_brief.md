# Panel & Toolbar Architecture — High‑Level Analysis Brief

## Purpose

This document describes the **structural layout model** of the application screen in a view‑agnostic manner. It focuses exclusively on **panels**, **panel‑bound toolbars**, **overlay panels**, and the **rules that govern how views attach to panels**.

Feature‑specific content is intentionally excluded. This includes modals, AI, settings, feature tools, and any view‑owned UI chrome that does not directly mutate panel structure.

The intent is to provide a **clear, consistent mental model** that can be used for design, implementation, state management, and validation.

---

## 1. Edge‑Addressable Screen Model

The screen is treated as an **edge‑addressable surface**. Structural elements (expanders and panel‑bound toolbars) claim discrete edge slots. Once claimed, a slot is unavailable to other structural elements.

### Canonical Edge Model

```
┌───────────────────────┐
│           ○         ○ │   Top edge
│                       │
│ ●                   ● │   Left / Right edges
│                       │
│ ○         ●         ○ │   Bottom edge
└───────────────────────┘
```

**Legend**
- **○** — Available edge slot
- **●** — Occupied edge slot

Overlay panels are not shown here because they do **not** participate in layout flow or edge ownership.

---

### Position Index Mapping (Reducer‑Friendly)

```
┌───────────────────────┐
│ X         0         1 │
│                       │
│ 2                   3 │
│                       │
│ 4         5         6 │
└───────────────────────┘
```

**Index semantics**
- Each number represents a **stable, serialisable edge position index**.
- Indices are suitable for reducer/state logic (for example: `toolbar.position = 3`).
- `X` represents an **invalid position**. The top‑left slot is never allowed.

**Edge mapping**
- `0, 1` → Top edge
- `2` → Left edge
- `3` → Right edge
- `4, 5, 6` → Bottom edge

---

### Edge Slot Rules

- Only **one structural element** (toolbar or expander) may occupy a slot at a time.
- Slots are mutually exclusive.
- Structural elements may move between slots if the target slot is free.
- Expanders reserve their corresponding edge slots while open.

---

## 2. Canonical Layout Geometry

The internal layout is defined by four primary regions: the **main view area**, **left expander**, **right expander**, and **bottom expansion area**.

```
┌─────────┬──────────────────────────┬─────────┐
│         │                          │         │
│         │                          │         │
│         │            M             │         │
│         │                          │         │
│    L    │                          │    R    │
│         │                          │         │
│         ├──────────────────────────┤         │
│         │                          │         │
│         │            B             │         │
│         │                          │         │
└─────────┴──────────────────────────┴─────────┘
```

---

## 3. Region Definitions (Authoritative)

### M — Main View Area

- Central, dominant workspace.
- Horizontally bounded by **L** and **R** when those expanders are open.
- Vertically bounded by **B** when the bottom expansion area is open.
- Internally subdividable into **1–5 equal‑width panels**.
- Internal subdivision **never changes the outer bounds** of the main view area.

> The main view area is a **single structural region**, regardless of internal panel count.

---

### L — Left Expander Panel

- Docked to the left edge.
- Width‑constrained.
- When open:
  - Reduces the available width of **M**.
  - Reduces the available width of **B**.
- Never overlaps **M** or **B**.

---

### R — Right Expander Panel

- Docked to the right edge.
- Width‑constrained.
- When open:
  - Reduces the available width of **M**.
  - Reduces the available width of **B**.
- Never overlaps **M** or **B**.

---

### B — Bottom Expansion Area

- Docked to the bottom edge.
- Height‑constrained.
- Expands upward.
- Horizontally bounded by the same constraints as **M**.
- Squeezed when **L** and/or **R** are open.
- Never overlaps **L** or **R**.

---

## 4. Main View Area Subdivision

### Panel Division Rules

- The main view area may be divided into **1 to 5 panels**.
- A maximum of **5 views** may be visible simultaneously.
- All panels are **equal width**.
- Panel count is controlled by a panel-bound size toolbar.

### View Assignment

- Default views are **feature-assigned (developer-controlled)**.
- User preferences may override defaults where permitted.

| Mode | Panels | Width per Panel |
| ---- | ------ | ---------------- |
| 1×   | 1      | 100%             |
| 2×   | 2      | 50%              |
| 3×   | 3      | 33.33%           |
| 4×   | 4      | 25%              |
| 5×   | 5      | 20%              |

### Behaviour

- Panels resize proportionally as expanders open or close.
- Each panel independently hosts a single view.
- All panels share vertical height and alignment.

---

## 5. Expander Panels (Docked Secondary Panels)

Expander panels are dock‑attached regions that **directly affect layout geometry**.

### Shared Constraints

- Left and right expanders reduce the available width of:
  - The main view area
  - The bottom expansion area
- The bottom expansion area never overlaps left or right expanders.
- Each expander hosts views independently.

---

## 6. Overlay Panels

Overlay panels are **in scope** and are **feature-driven**.

### Definition

- Overlay panels float above the docked layout.
- They do not affect layout sizing or edge ownership.

### Ownership and Control

- Overlay panels are **assigned by features (developer-controlled)**.
- They are **not user-controlled panels**.

### Visibility Rule

- An overlay panel is **only visible when at least one view is associated with it**.
- If no view is attached, the overlay panel does **not exist in the rendered layout**.

### Characteristics

- Visually layered above all docked regions.
- Exist only for the lifetime of their associated view(s).
- Removed automatically when their associated view is detached or closed.

> Overlay panels have **no independent structural existence** and are never user-instantiated.

---

## 7. Panel‑Bound Toolbars (Structural Scope Only)

This analysis includes **only toolbars that directly mutate panel structure**. Any toolbar that does not reference a panel via `toolbarId` is out of scope.

### In‑Scope Toolbar Types

- **Expander Toolbars**
  - Open and close left, right, and bottom expander panels.
  - `toolbarId` maps 1:1 to a specific panel.

- **Size Toolbar**
  - Controls main view area subdivision (1×–5×).
  - Directly mutates panel geometry.

- **Panel View Selectors**
  - Control which views are attached to which panels.
  - Operate strictly at the panel level.

### Explicit Exclusions

- View‑owned toolbars
- Feature or mode toolbars
- Contextual or transient UI chrome

> If a toolbar does not mutate **panel presence, size, or view attachment**, it is not part of this model.

---

## 8. View Attachment Model

Views are never attached directly to the screen.

```
View → Panel → Layout
```

**Implications**

- Panels are stable structural containers.
- Views may be reassigned or moved without changing layout rules.
- Layout logic remains invariant as content changes.

---

## 9. Summary Table

| Element               | Docked | Affects Layout | Overlaps | Hosts Views |
| --------------------- | ------ | -------------- | -------- | ----------- |
| Main View Area        | Yes    | Yes            | No       | Yes         |
| Left Expander Panel   | Yes    | Yes            | No       | Yes         |
| Right Expander Panel  | Yes    | Yes            | No       | Yes         |
| Bottom Expansion Area | Yes    | Yes            | No       | Yes         |
| Overlay Panel         | No     | No             | Yes      | Conditional |
| Panel‑Bound Toolbar   | Yes    | Yes            | No       | No          |

---

## 10. Panel Roles (Common Usage)

While the layout model is **view‑agnostic**, panels tend to converge on consistent *roles* based on their position. These roles are **conventional, not enforced**, but provide useful guidance for design and implementation.

### Overlay Panel — Feature‑Driven Top‑Level Operations

- Used for **feature-driven, top-level operations**.
- Assigned exclusively by the system or features (developer-controlled).
- Not directly user-configurable.
- Typical responsibilities include:
  - Load
  - Save
  - Export

---

### Left Expander Panel — High‑Level Operations

- Majority of views are **feature-assigned (developer-controlled)**.
- A small number of views may be **user-assigned exceptions**.
- Used for **high-level, structural actions**.
- Common responsibilities include:
  - Libraries
  - Templates
  - Import / source selection

---

### Bottom Expansion Area — Mid‑Level Operations

- Majority of views are **feature-assigned (developer-controlled)**.
- A small number of views may be **user-assigned exceptions**.
- Used for **assistive and guided workflows**.
- Common responsibilities include:
  - Assistance and help
  - AI surfaces
  - Wizards
  - Editors

---

### Right Expander Panel — Low‑Level Operations

- Majority of views are **feature-assigned (developer-controlled)**.
- A small number of views may be **user-assigned exceptions**.
- Used for **fine-grained and contextual controls**.
- Common responsibilities include:
  - Selection details
  - Properties and inspectors
  - Dispatch and actions
  - Processing controls

---

## Core Principle

> **Panels define structure.**  \
> **Views provide content.**  \
> **Toolbars mutate structure.**  \
> **Overlays are view‑driven and ephemeral.**

