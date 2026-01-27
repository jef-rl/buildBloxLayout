















Here is the updated technical plan focusing on constraints for left, right and bottom expander panels.

---

## 📐 Layout Architecture

Using **CSS Grid** is the most reliable way to handle these specific units, as it manages the "Center Workspace" automatically when panels are toggled.

### Grid Definition

The parent container should be defined as:

* **Columns:** `[Left] 25vw | [Center] 1fr | [Right] 25vw`
* **Rows:** `[Top/Main] 1fr | [Bottom] 25vh`

---

## 🛠️ Updated State Logic the panels are not simply toggles between open -> closed there are 2 adittional settings for each

### Left & Right Panels ()

* **Hidden State:** Set width to `0vw`. Set `visibility: hidden`.
* **Closed State:** Set width to `0vw`.
* **Open State:** Set width to `25vw`.
* **Expanded (Locked):** Set width to `25vw`. make buttons to 'open' pointer events on the toggle button.

### Bottom Panel ()

* **Hidden State:** Set height to `0vh`.
* **Closed State:** Set height to `0vh`.
* **Open State:** Set height to `25vh`.
* **Expanded (Locked):** Set height to `25vh`.

---

## 💻 CSS Implementation Strategy

To make this performant, use **CSS Variables**. This allows you to toggle a single class on the parent container to update the entire layout.

```css
:root {
  --left-width: 0vw;
  --right-width: 0vw;
  --bottom-height: 0vh;
}

/* State: Open/Expanded */
.layout.left-open { --left-width: 25vw; }
.layout.right-open { --right-width: 25vw; }
.layout.bottom-open { --bottom-height: 25vh; }

.container {
  display: grid;
  grid-template-columns: var(--left-width) 1fr var(--right-width);
  grid-template-rows: 1fr var(--bottom-height);
  height: 100vh;
  width: 100vw;
  transition: grid-template-columns 0.3s ease, grid-template-rows 0.3s ease;
}

```
