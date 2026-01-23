To align your React-based platform with the visual identity of your current trading software while maintaining the high-end analytical feel of TradeZella, we need a **"Pro-Dark" Theme System**.

As your Product Manager, I’ve defined the visual specifications to ensure the UI doesn't just look good, but enhances "Data Readability" during high-stress reviews.

---

## 1. The Core Color Palette

We will use a **Deep Obsidian** base. This ensures that the high-saturation buy/sell colors "pop" without causing eye strain during long journaling sessions.

| Element | Color Value | Usage |
| --- | --- | --- |
| **Primary Background** | `#0B0E11` | The main application background. |
| **Surface/Card Background** | `#151921` | Tool containers, sidebars, and trade cards. |
| **Border / Divider** | `#2B2F36` | Subtle separation of data tables and charts. |
| **Action: BUY (Mint)** | `rgb(0, 255, 150)` | Entry signals, profit bars, and win indicators. |
| **Action: SELL (Periwinkle)** | `rgb(128, 128, 255)` | Exit signals, loss bars, and short-position tags. |
| **Primary Text** | `#E6E8EA` | Headings, P&L totals, and labels. |
| **Secondary Text** | `#848E9C` | Timestamps, descriptions, and metadata. |

---

## 2. Visual Hierarchy & Surface System

Since you are building a data-heavy app, we will use **Elevation through Color**, not shadows.

* **The "Glass" Effect:** For modals (like the Daily Journal), we will use a semi-transparent version of the Surface color with a `backdrop-filter: blur(8px)`.
* **Active States:** Any selected menu item or active filter will use a subtle glow effect (box-shadow) utilizing the **Buy Mint** color at 20% opacity.
* **Data Density:** Tables will be "Zebra Striped" with a very slight difference between `#151921` and `#1A1F26` to help the eye track rows across the screen.

---

## 3. The Analytical Chart System

Your charts need to feel like an extension of the platform shown in your image.

* **Candlestick Harmony:** * **Bullish Candles:** Solid `rgb(0, 255, 150)`.
* **Bearish Candles:** Solid `rgb(128, 128, 255)`.


* **The execution Plotter:** * When you view a trade detail, entries will be marked with a Mint Triangle pointing up () and exits with a Periwinkle Triangle pointing down ().
* **Equity Curve Gradient:** The P&L graph will use a linear gradient:
* Top (Positive): `rgba(0, 255, 150, 0.3)` fading to transparent.
* Bottom (Negative): `rgba(128, 128, 255, 0.3)` fading to transparent.



---

## 4. Typography & Iconography

* **Font:** We will use a highly legible Sans-Serif (like **Inter** or **Roboto Mono**) to ensure numbers are perfectly aligned in tables.
* **Monospaced P&L:** All currency and R-Multiple values will use a Monospaced font so that the decimal points always align vertically, making it easier to scan lists.
* **Icons:** Thin-stroke icons (Line Icons) to maintain a "light" feel on a dark background, preventing the UI from feeling cluttered.

---

## 5. Semantic Color Logic

We are redefining the "Green/Red" paradigm to fit your specific trading style:

* **Wins vs. Losses:** Instead of standard Red, a loss is represented by the **Sell Periwinkle** (`rgb(128, 128, 255)`). This reduces the "emotional sting" of seeing red and keeps the platform visually consistent with your trading executions.
* **Warning States:** For "Mistake Tags" or "High Risk" alerts, we will use a **Vibrant Yellow** (`#FCD535`) to draw immediate attention without breaking the Mint/Periwinkle harmony.


---

### Observations

All colors used must come from config, we could change it easily latter.
