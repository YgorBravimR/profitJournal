# The Complete React & Next.js Animation Guide

> A deep, practical guide to animation in React and Next.js — covering Framer Motion (Motion), pure CSS techniques, performance optimization, and the developer tricks that solve real-world problems.

---

## Table of Contents

- [1. Library Setup & Migration](#1-library-setup--migration)
- [2. The Five Core Animation Techniques](#2-the-five-core-animation-techniques)
- [3. Framer Motion (Motion) Deep Dive](#3-framer-motion-motion-deep-dive)
  - [3.1 Core Concepts](#31-core-concepts) · [3.2 Variants](#32-variants-the-power-pattern) · [3.3 AnimatePresence](#33-animatepresence-exit-animations) · [3.4 Layout Animations](#34-layout-animations) · [3.5 Motion Value Hooks](#35-motion-value-hooks) · [3.6 Gestures](#36-gesture-animations) · [3.7 Scroll Animations](#37-scroll-animations-advanced) · [3.8 useAnimate & Timeline](#38-useanimate--timeline-sequences) · [3.9 stagger](#39-the-stagger-function) · [3.10 Reorder](#310-reorder-components) · [3.11 useMotionValueEvent](#311-usemotionvalueevent) · [3.12 useVelocity](#312-usevelocity) · [3.13 MotionConfig](#313-motionconfig-global-configuration) · [3.14 Layout Deep Dive](#314-layout-animation-deep-dive-from-the-docs)
- [4. Pure CSS Animation Techniques](#4-pure-css-animation-techniques)
- [5. Performance Optimization](#5-performance-optimization)
- [6. Common Bugs & Fixes](#6-common-bugs--fixes)
- [7. Next.js Specific Patterns](#7-nextjs-specific-patterns)
- [8. Accessibility](#8-accessibility)
- [9. Advanced Patterns & Recipes](#9-advanced-patterns--recipes)
- [10. Tools & Resources](#10-tools--resources)
- [References](#references)

---

## 1. Library Setup & Migration

### Installing Motion (formerly Framer Motion)

Framer Motion has been rebranded to **Motion**. The new package is lighter and faster.

```bash
# New way (recommended)
npm install motion

# Legacy (still works, but deprecated)
npm install framer-motion
```

### Import Paths

```tsx
// For Client Components (standard React)
import { motion, AnimatePresence } from "motion/react"

// For React Server Components (Next.js App Router)
import { motion } from "motion/react-client"

// Legacy import (still works but migrate away)
import { motion } from "framer-motion"
```

### Migration Checklist

| Old (`framer-motion`)            | New (`motion`)                     |
| -------------------------------- | ---------------------------------- |
| `import from "framer-motion"`    | `import from "motion/react"`       |
| SSR: `import from "framer-motion"` | SSR: `import from "motion/react-client"` |
| `AnimateSharedLayout` (removed)  | Use `LayoutGroup` instead          |
| `useAnimation`                   | Still available, same API          |

> The core API remains the same. The migration is mostly about changing import paths.

---

## 2. The Five Core Animation Techniques

These are the "Pareto Principle" of web animation — 20% of techniques that create 80% of the animations you see on award-winning websites.

> **Source:** This section is inspired by the video *"My Top 5 Techniques for Web Animation"* (transcription in `animation/My Top 5 Techniques for Web Animation.txt`) by a creative web agency developer who remakes award-winning animations. The core insight: most award-winning sites use the same repeating set of techniques.

### 2.1 Scroll Tracking

Track the scroll progress of a page section and map it to animation values.

**With Motion:**
```tsx
import { useScroll, useTransform, motion } from "motion/react"

const ParallaxSection = () => {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0])

  return (
    <motion.div style={{ y, opacity }}>
      Content moves with scroll
    </motion.div>
  )
}
```

**The Jank Problem:** Mouse wheel scrolling produces choppy, discrete jumps. Since animations are tied to scroll position, they become equally choppy.

**The Fix:** Use a smooth scroll library like **Lenis**:

```bash
npm install lenis
```

```tsx
"use client"
import { ReactLenis } from "lenis/react"

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,       // Interpolation factor (lower = smoother)
        duration: 1.2,    // Duration of the scroll animation
        smoothTouch: false // Disable on touch devices (better UX)
      }}
    >
      {children}
    </ReactLenis>
  )
}
```

> **Trick:** Set `smoothTouch: false` — smooth scrolling on mobile often fights with native scroll behavior and causes more problems than it solves.

### 2.2 Viewport Detection (Scroll-Triggered Animations)

Trigger animations when elements enter the viewport. This is used on **every** award-winning website.

**With Motion:**
```tsx
import { useInView } from "motion/react"
import { useRef } from "react"

const FadeInSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,    // Only trigger once
    margin: "-100px" // Trigger 100px before entering viewport
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      I fade in when scrolled into view
    </motion.div>
  )
}
```

**With Intersection Observer (vanilla):**
```tsx
import { useEffect, useRef, useState } from "react"

const useIsVisible = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect() // Once triggered, stop observing
      }
    }, options)

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}
```

> **Trick:** Use `margin: "-100px"` (negative) to trigger animations *before* the element fully enters the viewport. This makes animations feel more responsive.

### 2.3 CSS Sticky Position

Deceptively simple but extremely powerful. Many "complex" scroll animations are just clever uses of `position: sticky`.

```css
.sticky-container {
  height: 300vh; /* Creates the scroll distance */
}

.sticky-element {
  position: sticky;
  top: 0;
  height: 100vh;
}
```

**The Trick:** Combine sticky positioning with scroll-tracked values:

```tsx
const StickyReveal = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1])

  return (
    <div ref={containerRef} style={{ height: "300vh" }}>
      <motion.div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          scale
        }}
      >
        I stick and scale as you scroll
      </motion.div>
    </div>
  )
}
```

> **Why it's "OP":** No weird bugs, native browser support, works in every browser, and when combined with scroll tracking, creates animations that look impossibly complex.

### 2.4 Easing Functions

Easings define the **character** of your animations. They're the difference between an amateur and a professional website.

**Common Presets:**
```tsx
// Smooth deceleration (most common for UI)
transition={{ ease: "easeOut", duration: 0.3 }}

// Acceleration then deceleration (good for page transitions)
transition={{ ease: "easeInOut", duration: 0.5 }}

// Custom cubic-bezier (luxury feel)
transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.7 }}
```

**Popular Cubic-Bezier Curves:**
```css
/* Apple-style smooth */
--ease-apple: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Aggressive snap */
--ease-snap: cubic-bezier(0.87, 0, 0.13, 1);

/* Bouncy overshoot */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Luxury slow reveal */
--ease-luxury: cubic-bezier(0.76, 0, 0.24, 1);

/* Spring-like (overshoots and settles) */
--ease-spring: cubic-bezier(0.8, -0.5, 0.2, 1.8);
```

**Spring Physics in Motion:**
```tsx
// Default spring (stiffness: 100, damping: 10, mass: 1)
transition={{ type: "spring" }}

// Snappy UI interaction
transition={{ type: "spring", stiffness: 300, damping: 20 }}

// Gentle, luxury feel
transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1.5 }}

// Bouncy, playful
transition={{ type: "spring", stiffness: 200, damping: 10 }}
```

> **Trick:** Use spring animations for anything interactive (buttons, modals, drag). Use tween/easing for scroll-linked and entrance animations. Springs handle interruption naturally — if a user clicks again mid-animation, the spring recalculates from the current velocity.

### 2.5 Text Splitting

Split paragraphs into lines, words, or characters to animate them individually.

**With SplitType (free):**
```bash
npm install split-type
```

```tsx
"use client"
import { useEffect, useRef } from "react"
import SplitType from "split-type"
import { motion, useInView } from "motion/react"

const AnimatedText = ({ text }: { text: string }) => {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!ref.current) return

    const split = new SplitType(ref.current, {
      types: "words,chars"
    })

    // Cleanup on unmount
    return () => split.revert()
  }, [])

  return (
    <p ref={ref} aria-label={text}>
      {text}
    </p>
  )
}
```

**Pure React approach (no library):**
```tsx
const SplitText = ({ text, delay = 0.03 }: { text: string; delay?: number }) => {
  const words = text.split(" ")

  return (
    <span aria-label={text}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.5,
              delay: wordIndex * delay,
              ease: [0.76, 0, 0.24, 1]
            }}
          >
            {word}
          </motion.span>
          {wordIndex < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  )
}
```

> **Critical Trick — the `overflow-hidden` wrapper:** The parent `<span>` has `overflow-hidden` and the child `<motion.span>` translates from `y: "100%"`. This creates a "reveal from below" effect. Without the wrapper, you'd just see the text sliding — the wrapper acts as a mask. This is the #1 technique for text reveal animations.

> **Accessibility Warning:** Always add `aria-label` with the full text on the parent element. Screen readers will read the label instead of the fragmented span elements.

> **Resize Bug:** When text is split into lines, resizing the window can break the line calculations. Always `revert()` the split on unmount and re-split on resize with a debounced handler.

---

## 3. Framer Motion (Motion) Deep Dive

### 3.1 Core Concepts

**Motion Components:**
```tsx
// Any HTML element can be animated by prefixing with motion.
<motion.div />
<motion.span />
<motion.svg />
<motion.path />

// Custom components need forwardRef
const MyComponent = React.forwardRef((props, ref) => (
  <div ref={ref} {...props} />
))
const MotionMyComponent = motion.create(MyComponent)
```

**The Three Animation States:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}    // Starting state
  animate={{ opacity: 1, y: 0 }}     // Target state
  exit={{ opacity: 0, y: -20 }}      // Unmount state (requires AnimatePresence)
/>
```

### 3.2 Variants (The Power Pattern)

Variants let you define named animation states and orchestrate them across component trees.

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,       // Delay between each child
      delayChildren: 0.2,         // Delay before first child starts
      staggerDirection: 1,        // 1 = first-to-last, -1 = last-to-first
      when: "beforeChildren"      // "beforeChildren" | "afterChildren"
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

const StaggeredList = ({ items }: { items: string[] }) => (
  <motion.ul
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {items.map((item) => (
      <motion.li key={item} variants={itemVariants}>
        {item}
      </motion.li>
    ))}
  </motion.ul>
)
```

> **Key Trick — Variant Propagation:** Children don't need their own `animate` prop. When a parent changes variant (e.g., from `"hidden"` to `"visible"`), all children with matching variant names automatically animate. This eliminates prop drilling for animations.

### 3.3 AnimatePresence (Exit Animations)

The most misunderstood API in Motion. Without it, components just disappear when unmounted.

```tsx
import { AnimatePresence, motion } from "motion/react"

const Modal = ({ isOpen }: { isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        Modal Content
      </motion.div>
    )}
  </AnimatePresence>
)
```

**AnimatePresence Modes:**

| Mode         | Behavior                                                    |
| ------------ | ----------------------------------------------------------- |
| `"sync"`     | (Default) New and old elements animate simultaneously       |
| `"wait"`     | New element waits for old to finish exit before entering     |
| `"popLayout"` | Exiting element is popped out of layout flow immediately   |

```tsx
<AnimatePresence mode="wait">
  <motion.div key={currentPage}>
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

> **`mode="popLayout"` is a game-changer:** When an element exits, it's immediately removed from the layout flow (like `position: absolute`). This prevents the "jump" where the entering element gets pushed down by the exiting one. Use this for tab switches, page transitions, and any swap animation.

### 3.4 Layout Animations

The `layout` prop animates any CSS layout change (position, size, flex, grid) using the FLIP technique internally.

```tsx
// Simple: animate layout changes
<motion.div layout />

// With ID: animate between different DOM elements
<motion.div layoutId="shared-element" />
```

**Practical Example — Expanding Card:**
```tsx
const ExpandableCard = ({ isExpanded }: { isExpanded: boolean }) => (
  <motion.div
    layout
    className={isExpanded ? "w-full h-64" : "w-48 h-24"}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <motion.h2 layout="position">Title</motion.h2>
    {isExpanded && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Expanded content
      </motion.p>
    )}
  </motion.div>
)
```

> **Trick — `layout="position"`:** When you only want to animate the position (not the size) of a child element, use `layout="position"`. This prevents text from warping/scaling during the parent's size change.

> **Trick — `LayoutGroup`:** Wrap multiple layout-animated components in `<LayoutGroup>` to coordinate their animations and prevent choppy concurrent transitions.

### 3.5 Motion Value Hooks

These hooks let you create animations that bypass React's render cycle — they update the DOM directly for maximum performance.

**useMotionValue:**
```tsx
import { useMotionValue, motion } from "motion/react"

const DragCard = () => {
  const x = useMotionValue(0)

  return (
    <motion.div
      drag="x"
      style={{ x }}
      onDragEnd={() => x.set(0)} // Snap back
    >
      Drag me
    </motion.div>
  )
}
```

**useTransform — The Map Function:**

This is the mathematical "map" function — transforms a value range into another range.

```tsx
import { useScroll, useTransform, motion } from "motion/react"

const ParallaxImage = () => {
  const { scrollYProgress } = useScroll()

  // Map scroll 0-1 to y position 0 to -200
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])

  // Map scroll 0-1 to scale 1 to 1.2
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  // Map scroll 0-0.5-1 to opacity 0-1-0
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])

  return <motion.img style={{ y, scale, opacity }} />
}
```

> **Why this is powerful:** `useTransform` doesn't trigger React re-renders. It updates the DOM directly through Motion's optimized renderer. You can chain transforms, compose them, and create complex multi-property animations that all run at 60fps without touching React state.

**useSpring — Smooth following:**
```tsx
import { useMotionValue, useSpring, motion } from "motion/react"

const SmoothCursor = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring follows the mouse with physics
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }

  return (
    <div onMouseMove={handleMouseMove} className="relative w-full h-screen">
      <motion.div
        className="fixed w-8 h-8 rounded-full bg-blue-500 pointer-events-none"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%"
        }}
      />
    </div>
  )
}
```

**useMotionTemplate — Combine values:**
```tsx
import { useMotionTemplate, useMotionValue, motion } from "motion/react"

const GlowCard = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Create a radial gradient that follows the mouse
  const background = useMotionTemplate`radial-gradient(
    200px circle at ${mouseX}px ${mouseY}px,
    rgba(255,255,255,0.1),
    transparent 80%
  )`

  return (
    <motion.div
      style={{ background }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }}
    >
      Hover me for glow effect
    </motion.div>
  )
}
```

### 3.6 Gesture Animations

**Hover, Tap, Focus:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ boxShadow: "0 0 0 3px rgba(66,153,225,0.6)" }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

**Drag with Constraints:**
```tsx
const constraintsRef = useRef(null)

<div ref={constraintsRef} className="w-96 h-96 bg-gray-100 rounded-xl">
  <motion.div
    drag
    dragConstraints={constraintsRef}
    dragElastic={0.2}           // How much it can be dragged past bounds (0-1)
    dragMomentum={true}         // Apply momentum when released
    dragTransition={{
      bounceStiffness: 600,     // How stiff the bounce is
      bounceDamping: 20         // How quickly it stops bouncing
    }}
    whileDrag={{ scale: 1.1, cursor: "grabbing" }}
    className="w-20 h-20 bg-blue-500 rounded-lg cursor-grab"
  />
</div>
```

### 3.7 Scroll Animations (Advanced)

**Element-based scroll tracking:**
```tsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
  // "start end" = animation starts when element's top reaches viewport bottom
  // "end start" = animation ends when element's bottom reaches viewport top
})
```

**Scroll velocity for direction detection:**
```tsx
import { useScroll, useMotionValueEvent } from "motion/react"

const ScrollDirectionNav = () => {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 150)
  })

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 w-full"
    >
      Navigation
    </motion.nav>
  )
}
```

### 3.8 useAnimate & Timeline Sequences

`useAnimate` gives you imperative control over animations, scoped to your component.

```tsx
import { useAnimate, stagger } from "motion/react"

const AnimatedList = () => {
  const [scope, animate] = useAnimate()

  const handleClick = async () => {
    // Selectors are scoped to the ref — "li" only selects children
    await animate("li", { opacity: 1, y: 0 }, {
      delay: stagger(0.1),
      duration: 0.4
    })
    await animate("li", { scale: 1.05 }, { duration: 0.2 })
    await animate("li", { scale: 1 }, { duration: 0.2 })
  }

  return (
    <ul ref={scope}>
      <li style={{ opacity: 0, y: 20 }}>Item 1</li>
      <li style={{ opacity: 0, y: 20 }}>Item 2</li>
      <li style={{ opacity: 0, y: 20 }}>Item 3</li>
      <button onClick={handleClick}>Animate</button>
    </ul>
  )
}
```

**Timeline Sequences:**
```tsx
const [scope, animate] = useAnimate()

// Each segment plays one after another by default
const sequence = [
  ["#title", { opacity: 1, y: 0 }, { duration: 0.5 }],
  ["#subtitle", { opacity: 1, y: 0 }, { duration: 0.3, at: "-0.2" }], // Overlap by 0.2s
  ["#cta", { opacity: 1, scale: 1 }, { duration: 0.4, at: "+0.1" }],  // 0.1s after previous
]

const controls = animate(sequence)
controls.speed = 1.5  // Playback speed
controls.pause()      // Pause
controls.play()       // Resume
controls.stop()       // Stop and reset
```

> **Key Advantage:** `useAnimate` automatically cleans up all animations when the component unmounts. No memory leaks. Scoped selectors mean `"li"` only targets children of the scope ref, not every `li` on the page.

### 3.9 The `stagger` Function

More powerful than `staggerChildren` — works with both variants and `useAnimate`.

```tsx
import { stagger } from "motion/react"

// Basic: 0.1s delay between each
stagger(0.1)

// Start from center of the list
stagger(0.1, { from: "center" })

// Start from last item
stagger(0.1, { from: "last" })

// Start from a specific index
stagger(0.1, { from: 3 })

// Add initial delay before stagger begins
stagger(0.1, { startDelay: 0.5 })

// Use with variants
const parentVariants = {
  open: {
    opacity: 1,
    transition: { delayChildren: stagger(0.1, { from: "center" }) }
  },
  closed: {
    opacity: 0,
    transition: { delayChildren: stagger(0.05, { from: "last" }) }
  }
}
```

### 3.10 Reorder Components

Built-in drag-to-reorder with automatic layout animations.

```tsx
import { Reorder } from "motion/react"
import { useState } from "react"

const ReorderableList = () => {
  const [items, setItems] = useState(["Item 1", "Item 2", "Item 3", "Item 4"])

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={setItems}
      className="flex flex-col gap-2"
    >
      {items.map((item) => (
        <Reorder.Item
          key={item}
          value={item}
          className="p-4 bg-white rounded-lg shadow cursor-grab active:cursor-grabbing"
          style={{ position: "relative" }} // Prevents z-index overlap bug
          whileDrag={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.15)" }}
        >
          {item}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

**Custom drag handle with `useDragControls`:**
```tsx
import { Reorder, useDragControls } from "motion/react"

const DragHandleItem = ({ item }: { item: string }) => {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab"
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        ⠿
      </button>
      <span>{item}</span>
    </Reorder.Item>
  )
}
```

> **Limitations:** `Reorder` is designed for simple single-axis lists. For multi-column, cross-container drag, or scrollable reorder containers, use [DnD Kit](https://dndkit.com/) instead.

> **Bug Fix — z-index overlap:** Dragged items can render behind siblings. Add `style={{ position: "relative" }}` as an inline style on `Reorder.Item` to fix this.

### 3.11 useMotionValueEvent

Listen to motion value changes without re-renders. Supports `"change"`, `"animationStart"`, `"animationComplete"`, and `"animationCancel"` events.

```tsx
import { useMotionValue, useMotionValueEvent } from "motion/react"

const TrackedDrag = () => {
  const x = useMotionValue(0)

  useMotionValueEvent(x, "animationStart", () => {
    console.log("Animation started")
  })

  useMotionValueEvent(x, "animationComplete", () => {
    console.log("Animation finished")
  })

  useMotionValueEvent(x, "change", (latest) => {
    // No re-render — runs outside React lifecycle
    if (Math.abs(latest) > 100) {
      console.log("Dragged past threshold")
    }
  })

  return <motion.div drag="x" style={{ x }} />
}
```

### 3.12 useVelocity

Creates a motion value that tracks the velocity of another motion value. Useful for physics-responsive animations.

```tsx
import { useMotionValue, useVelocity, useTransform, motion } from "motion/react"

const VelocitySkew = () => {
  const x = useMotionValue(0)
  const xVelocity = useVelocity(x)

  // Map velocity to a skew angle (-20deg to 20deg)
  const skewX = useTransform(xVelocity, [-1000, 0, 1000], ["-20deg", "0deg", "20deg"])

  return (
    <motion.div
      drag="x"
      style={{ x, skewX }}
      dragConstraints={{ left: -200, right: 200 }}
    >
      Drag me — I skew with velocity
    </motion.div>
  )
}
```

### 3.13 MotionConfig (Global Configuration)

Set default transitions, reduced motion policies, and CSP nonce for all child motion components.

```tsx
import { MotionConfig } from "motion/react"

const App = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    reducedMotion="user" // "user" | "always" | "never"
    nonce="random-csp-nonce" // For Content Security Policy
  >
    {children}
  </MotionConfig>
)
```

> **`reducedMotion` Behavior:** When set to `"user"` and the OS reduced motion setting is on, `transform` and `layout` animations are automatically disabled. Other animations like `opacity` and `backgroundColor` persist — this ensures meaningful visual feedback without motion-sickness-triggering movement.

### 3.14 Layout Animation Deep Dive (from the Docs)

**The three `layout` prop variants:**

| Value              | Animates Position | Animates Size | Use When                              |
| ------------------ | ----------------- | ------------- | ------------------------------------- |
| `layout={true}`    | Yes               | Yes           | General layout changes                |
| `layout="position"`| Yes               | No            | Text content that shouldn't warp      |
| `layout="size"`    | No                | Yes           | Width/height changes only             |

**Fixing borderRadius/boxShadow distortion:**

During layout animations, `borderRadius` and `boxShadow` can visually distort even when not being animated.

```tsx
// BUG — borderRadius distorts during scale
<motion.div layout className="rounded-lg shadow-lg" />

// FIX — set distorted properties as inline styles
<motion.div
  layout
  style={{
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  }}
/>
```

> **Why inline styles fix it:** Motion needs the raw computed values to counteract the distortion during FLIP transforms. CSS class values and CSS variables don't provide this — actual pixel/string values do.

**`layoutDependency` for performance:**
```tsx
// Only measure layout when `items.length` changes, not every render
<motion.div layout layoutDependency={items.length} />
```

**`layoutId` — Shared Element Transitions:**
```tsx
// Tab indicator that morphs between tabs
const TabBar = ({ activeTab }: { activeTab: string }) => (
  <div className="flex gap-4">
    {tabs.map((tab) => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
        {tab.label}
        {activeTab === tab.id && (
          <motion.div
            layoutId="tab-indicator"
            className="h-0.5 bg-blue-500"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    ))}
  </div>
)
```

**`LayoutGroup` — Two use cases:**

```tsx
// 1. Namespacing: prevent layoutId collisions
<LayoutGroup id="sidebar-tabs">
  <TabComponent />
</LayoutGroup>
<LayoutGroup id="main-tabs">
  <TabComponent /> {/* Same component, different namespace */}
</LayoutGroup>

// 2. Coordinating sibling animations
<LayoutGroup>
  <motion.div layout> {/* Collapsible panel */}
    <ExpandableContent />
  </motion.div>
  <motion.div layout> {/* This sibling smoothly adjusts position */}
    <SiblingContent />
  </motion.div>
</LayoutGroup>
```

---

## 4. Pure CSS Animation Techniques

### 4.1 Keyframe Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Stagger with animation-delay */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
```

> **Trick — `forwards` fill mode:** Without `animation-fill-mode: forwards`, the element snaps back to its pre-animation state when the animation ends. Always use `forwards` for entrance animations.

> **Trick — `opacity: 0` initial state:** Set elements to `opacity: 0` by default and let the animation bring them in. This prevents the "flash of unstyled content" where elements appear briefly before animating.

### 4.2 CSS Custom Properties for Animation

The `@property` rule lets the browser interpolate custom properties:

```css
@property --reveal-progress {
  syntax: "<number>";
  initial-value: 0;
  inherits: false;
}

.reveal-element {
  --reveal-progress: 0;
  clip-path: inset(0 calc((1 - var(--reveal-progress)) * 100%) 0 0);
  opacity: var(--reveal-progress);
  transition: --reveal-progress 0.8s ease-out;
}

.reveal-element.visible {
  --reveal-progress: 1;
}
```

> **Why @property matters:** Without it, custom properties are treated as strings and can't be interpolated. With `@property`, the browser knows the type and can smoothly transition between values.

### 4.3 The `linear()` Timing Function (Springs in CSS)

Create spring-like animations without JavaScript:

```css
/* Spring-like bounce */
.spring-animation {
  transition: transform 600ms linear(
    0, 0.006, 0.025, 0.057, 0.1, 0.152, 0.211, 0.276,
    0.346, 0.419, 0.493, 0.567, 0.639, 0.708, 0.773,
    0.832, 0.886, 0.932, 0.97, 1, 1.024, 1.04, 1.05,
    1.054, 1.052, 1.046, 1.036, 1.024, 1.011, 0.998,
    0.986, 0.977, 0.97, 0.966, 0.966, 0.968, 0.972,
    0.979, 0.986, 0.994, 1, 1.004, 1.006, 1.007,
    1.006, 1.003, 1.001, 0.999, 0.998, 0.998, 0.999, 1
  );
}
```

**Store as design tokens for consistency:**
```css
:root {
  /* Fallback for older browsers */
  --spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --spring-smooth-time: 600ms;

  @supports (animation-timing-function: linear(0, 1)) {
    --spring-smooth: linear(
      0, 0.006, 0.025, 0.057, 0.1, 0.152, 0.211, 0.276,
      0.346, 0.419, 0.493, 0.567, 0.639, 0.708, 0.773,
      0.832, 0.886, 0.932, 0.97, 1, 1.024, 1.04, 1.05,
      1.054, 1.052, 1.046, 1.036, 1.024, 1.011, 0.998,
      0.986, 0.977, 0.97, 0.966, 0.966, 0.968, 0.972,
      0.979, 0.986, 0.994, 1
    );
  }
}
```

> **Limitation:** When a CSS spring animation is interrupted mid-transition, the browser applies a "reversing shortening factor" that compresses the duration. A 1600ms spring might replay at 400ms, breaking the physics feel. For interruptible animations, prefer JavaScript springs (Motion's `type: "spring"`).

### 4.4 CSS Scroll-Driven Animations (No JS)

Modern CSS can tie animations to scroll position without any JavaScript:

```css
/* Scroll progress bar */
.progress-bar {
  animation: growWidth linear;
  animation-timeline: scroll();
}

@keyframes growWidth {
  from { width: 0%; }
  to { width: 100%; }
}

/* Animate when element enters viewport */
.fade-in-on-scroll {
  animation: fadeIn linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

> **Browser Support (2025):** Chrome full support, Firefox behind a flag, Safari not yet supported. Use as progressive enhancement with a JS fallback.

> **Performance Win:** These animations run off the main thread on the compositor, delivering GPU-accelerated 60fps without any JavaScript overhead.

### 4.5 The Cubic-Bezier Cheat Sheet

```css
/* Standard easings */
ease:         cubic-bezier(0.25, 0.1, 0.25, 1.0)
ease-in:      cubic-bezier(0.42, 0, 1.0, 1.0)
ease-out:     cubic-bezier(0, 0, 0.58, 1.0)
ease-in-out:  cubic-bezier(0.42, 0, 0.58, 1.0)

/* Custom curves for real projects */

/* Smooth deceleration (most UI animations) */
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Power curve (strong entrance) */
--ease-power3: cubic-bezier(0.645, 0.045, 0.355, 1);

/* Expo (dramatic, luxury sites) */
--ease-expo: cubic-bezier(0.16, 1, 0.3, 1);

/* Back (slight overshoot, playful) */
--ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Circ (sharp and precise) */
--ease-circ: cubic-bezier(0, 0.55, 0.45, 1);
```

---

## 5. Performance Optimization

### 5.1 The Golden Rule: Only Animate `transform` and `opacity`

The browser rendering pipeline has three stages: **Layout → Paint → Composite**.

| Property Type     | Triggers        | Cost   | Examples                          |
| ----------------- | --------------- | ------ | --------------------------------- |
| Layout properties | Layout + Paint + Composite | Expensive | `width`, `height`, `top`, `left`, `margin`, `padding` |
| Paint properties  | Paint + Composite | Medium   | `background-color`, `box-shadow`, `border-color` |
| Composite properties | Composite only | Cheap  | `transform`, `opacity`, `filter` |

**Always translate these:**
```css
/* BAD — triggers layout recalculation every frame */
.animated { left: 100px; top: 50px; width: 200px; }

/* GOOD — only composite, runs on GPU */
.animated { transform: translate(100px, 50px) scale(1.2); }
```

### 5.2 GPU Acceleration

**Promote elements to their own GPU layer:**
```css
/* Modern approach */
.animated-element {
  will-change: transform;
}

/* Legacy fallback (still works) */
.animated-element {
  transform: translateZ(0);
  /* or */
  transform: translate3d(0, 0, 0);
}
```

**Critical warnings:**
- **Don't apply `will-change` to everything.** Each promoted layer consumes GPU memory. On mobile devices, this can cause the browser to crash.
- **Remove `will-change` after animation completes** if the element won't animate again.
- **Use `will-change` on the element that actually animates**, not a parent wrapper.

```css
/* GOOD: Apply on hover, remove after */
.card:hover .card-image {
  will-change: transform;
}

/* BAD: Applied globally forever */
* {
  will-change: transform;
}
```

### 5.3 React-Specific Performance

**Use `useRef` instead of `useState` for animation values:**
```tsx
// BAD — triggers re-render every frame
const [position, setPosition] = useState({ x: 0, y: 0 })

// GOOD — no re-renders
const position = useRef({ x: 0, y: 0 })
```

**Use Motion Values instead of state:**
```tsx
// BAD — re-renders on every scroll event
const [scrollY, setScrollY] = useState(0)
useEffect(() => {
  const handler = () => setScrollY(window.scrollY)
  window.addEventListener("scroll", handler)
  return () => window.removeEventListener("scroll", handler)
}, [])

// GOOD — no re-renders, updates DOM directly
const { scrollY } = useScroll()
const opacity = useTransform(scrollY, [0, 300], [1, 0])
```

**Isolate animated components:**
```tsx
// BAD — entire page re-renders when animation state changes
const Page = () => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div>
      <Header /> {/* Re-renders unnecessarily */}
      <AnimatedCard isHovered={isHovered} onHover={setIsHovered} />
      <Footer /> {/* Re-renders unnecessarily */}
    </div>
  )
}

// GOOD — only the card re-renders
const AnimatedCard = () => {
  const [isHovered, setIsHovered] = useState(false) // State is isolated
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    />
  )
}
```

### 5.4 Animation Duration Guidelines

| Animation Type         | Duration    | Notes                          |
| ---------------------- | ----------- | ------------------------------ |
| Micro-interactions     | 100-200ms   | Buttons, toggles, hover states |
| UI transitions         | 200-350ms   | Modals, dropdowns, tabs        |
| Page/route transitions | 300-500ms   | Full page content swaps        |
| Scroll-linked          | N/A         | Tied to scroll, no fixed duration |
| Entrance animations    | 400-800ms   | Hero sections, splash screens  |

> **Trick — The 300ms Rule:** Any animation longer than 300ms for a repeated interaction (like clicking a button) will feel sluggish. Reserve longer durations for one-time or infrequent animations.

---

## 6. Common Bugs & Fixes

### 6.1 AnimatePresence Exit Animations Not Working

**Bug:** Components disappear instantly instead of animating out.

**Common Causes and Fixes:**

**1. AnimatePresence is unmounting with the child:**
```tsx
// BUG — AnimatePresence unmounts, so it can't manage the exit
{showSection && (
  <AnimatePresence>
    <motion.div exit={{ opacity: 0 }}>Content</motion.div>
  </AnimatePresence>
)}

// FIX — AnimatePresence stays mounted, only children unmount
<AnimatePresence>
  {showSection && (
    <motion.div exit={{ opacity: 0 }}>Content</motion.div>
  )}
</AnimatePresence>
```

**2. Missing `key` prop:**
```tsx
// BUG — no key, AnimatePresence can't track the element
<AnimatePresence>
  {items.map((item) => (
    <motion.div exit={{ opacity: 0 }}>{item.name}</motion.div>
  ))}
</AnimatePresence>

// FIX — unique, stable key
<AnimatePresence>
  {items.map((item) => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>{item.name}</motion.div>
  ))}
</AnimatePresence>
```

**3. React Fragment wrapper:**
```tsx
// BUG — Fragment breaks AnimatePresence tracking
<AnimatePresence>
  {isVisible && (
    <>
      <motion.div exit={{ opacity: 0 }}>A</motion.div>
      <motion.div exit={{ opacity: 0 }}>B</motion.div>
    </>
  )}
</AnimatePresence>

// FIX — use a single motion wrapper or individual keys
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      <div>A</div>
      <div>B</div>
    </motion.div>
  )}
</AnimatePresence>
```

**4. Using array indices as keys:**
```tsx
// BUG — index keys change when items reorder
{items.map((item, index) => (
  <motion.div key={index} exit={{ opacity: 0 }} />
))}

// FIX — use stable, unique identifiers
{items.map((item) => (
  <motion.div key={item.id} exit={{ opacity: 0 }} />
))}
```

### 6.2 Layout Animation Flickering

**Bug:** Elements blink or flicker during layout animations, especially with `layoutId`.

**Fixes:**

**1. Add `layoutScroll` to scrollable containers:**
```tsx
// If the animated element is inside a scrollable container
<motion.div layoutScroll style={{ overflow: "auto" }}>
  <motion.div layoutId="card">Card</motion.div>
</motion.div>
```

**2. Add `layoutRoot` to fixed elements:**
```tsx
// If the animated element is inside a fixed/absolute container
<motion.div layoutRoot style={{ position: "fixed" }}>
  <motion.div layoutId="panel">Panel</motion.div>
</motion.div>
```

**3. Use `layout="position"` on text elements:**
```tsx
// Prevents text from warping/scaling during parent size change
<motion.div layout>
  <motion.h2 layout="position">Title won't warp</motion.h2>
</motion.div>
```

**4. Wrap in `LayoutGroup` for coordinated animations:**
```tsx
<LayoutGroup>
  <motion.div layout key="list">
    {items.map(item => (
      <motion.div layout key={item.id}>{item.name}</motion.div>
    ))}
  </motion.div>
</LayoutGroup>
```

### 6.3 Layout Animation + AnimatePresence Blink

**Bug:** When using `layoutId` with `AnimatePresence`, elements blink on enter/exit.

**Fix — Use `mode="popLayout"`:**
```tsx
<AnimatePresence mode="popLayout">
  <motion.div
    key={selectedId}
    layoutId="shared"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />
</AnimatePresence>
```

> **Why this works:** `popLayout` removes the exiting element from the layout flow immediately, preventing the layout engine from trying to position both the entering and exiting elements simultaneously.

### 6.4 Next.js App Router + AnimatePresence Page Transitions

**Bug:** `AnimatePresence` doesn't detect page changes in Next.js App Router because the layout component doesn't remount.

**Fix — Use `usePathname` as key:**
```tsx
"use client"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"

const PageTransitionLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

> **Known Limitation:** As of 2025, full exit animations before navigation don't work reliably with App Router because Next.js streams the new page before the exit animation completes. Consider using the View Transitions API (see section 7) as an alternative.

### 6.5 Hydration Mismatch with `initial` Prop

**Bug:** Server-rendered HTML doesn't match client-side initial state, causing hydration warnings.

**Fix — Use `initial={false}` or match server state:**
```tsx
// Option 1: Skip initial animation on mount (no hydration mismatch)
<motion.div
  initial={false}
  animate={{ opacity: 1, y: 0 }}
/>

// Option 2: Match the server render to the animate state
// (only use initial for non-SSR scenarios)
```

### 6.6 CSS Animation Flicker on First Load

**Bug:** Elements briefly appear in their final state before the animation starts.

**Fix:**
```css
/* Set initial state in CSS, not just in animation */
.animated-element {
  opacity: 0;
  transform: translateY(20px);
}

.animated-element.visible {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

> **Trick:** In Tailwind, use `opacity-0 translate-y-5` as the default class, then toggle to your animation class. This ensures the element is hidden before JavaScript loads.

### 6.7 `requestAnimationFrame` Double-Frame Bug

**Bug:** When applying transforms and then starting a transition, the browser may batch them into the same frame, making the transition invisible.

**Fix — Double `requestAnimationFrame`:**
```tsx
// Apply the inverted transform
element.style.transform = `translateY(${deltaY}px)`
element.style.transition = "none"

// Wait one frame for the browser to paint the inverted state
requestAnimationFrame(() => {
  // Then in the NEXT frame, apply the transition
  requestAnimationFrame(() => {
    element.style.transform = ""
    element.style.transition = "transform 500ms ease-out"
  })
})
```

> **Why double rAF:** The browser may batch the first rAF into the same paint cycle. The second rAF guarantees a new frame, ensuring the browser has painted the inverted state before the transition begins.

---

## 7. Next.js Specific Patterns

### 7.1 The "use client" Wrapper Pattern

Motion components are client-side only. Create reusable wrapper components:

```tsx
// src/components/motion/index.tsx
"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import { forwardRef } from "react"

type MotionDivProps = HTMLMotionProps<"div">

const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>((props, ref) => (
  <motion.div ref={ref} {...props} />
))
MotionDiv.displayName = "MotionDiv"

type MotionSectionProps = HTMLMotionProps<"section">

const MotionSection = forwardRef<HTMLElement, MotionSectionProps>((props, ref) => (
  <motion.section ref={ref} {...props} />
))
MotionSection.displayName = "MotionSection"

export { MotionDiv, MotionSection }
```

**Use in Server Components:**
```tsx
// This is a Server Component (no "use client")
import { MotionDiv } from "@/components/motion"

const ServerPage = () => (
  <div>
    <h1>Server-rendered heading</h1>
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      This part is animated on the client
    </MotionDiv>
  </div>
)
```

### 7.2 View Transitions API (Next.js 15+)

The native browser API for page transitions, now supported in Next.js:

**Enable in `next.config.ts`:**
```ts
const nextConfig = {
  experimental: {
    viewTransition: true
  }
}

export default nextConfig
```

**Use React's `<ViewTransition>` component:**
```tsx
import { unstable_ViewTransition as ViewTransition } from "react"

const Page = () => (
  <ViewTransition>
    <main>
      <h1>Page Content</h1>
    </main>
  </ViewTransition>
)
```

**Customize with CSS:**
```css
::view-transition-old(root) {
  animation: fade-out 300ms ease-out;
}

::view-transition-new(root) {
  animation: fade-in 300ms ease-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

> **Progressive enhancement:** Browsers that don't support View Transitions still work perfectly — users just won't see the transition animation. No JavaScript fallback needed.

### 7.3 Lazy Loading Animated Components

Heavy animation components shouldn't block the initial page load:

```tsx
import dynamic from "next/dynamic"

const HeavyAnimation = dynamic(
  () => import("@/components/heavy-animation"),
  {
    ssr: false,        // Don't render on server
    loading: () => <div className="h-96 animate-pulse bg-gray-100" />
  }
)
```

---

## 8. Accessibility

### 8.1 `prefers-reduced-motion`

Always respect the user's motion preferences.

**CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**React Hook:**
```tsx
const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return prefersReduced
}

// Usage
const AnimatedComponent = () => {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
    />
  )
}
```

**With Motion's built-in support:**
```tsx
import { MotionConfig } from "motion/react"

const App = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig reducedMotion="user">
    {children}
  </MotionConfig>
)
```

> `"user"` respects the OS setting. `"always"` forces reduced motion. `"never"` ignores the setting (not recommended).

### 8.2 Animation Accessibility Checklist

- Add `aria-label` to split text elements
- Use `aria-hidden="true"` on purely decorative animations
- Ensure animated elements are keyboard-navigable
- Don't rely on animation alone to convey information
- Keep looping/repeating animations minimal or pausable
- Reduced motion shouldn't mean *no* motion — opacity fades are usually acceptable

---

## 9. Advanced Patterns & Recipes

### 9.1 The FLIP Technique (How Layout Animations Work)

**F**irst, **L**ast, **I**nvert, **P**lay — the algorithm behind Motion's `layout` prop.

```tsx
// Manual FLIP implementation (educational — use Motion's layout prop instead)
const flipAnimate = (element: HTMLElement, doChange: () => void) => {
  // FIRST: capture current position
  const first = element.getBoundingClientRect()

  // Execute the change
  doChange()

  // LAST: capture new position
  const last = element.getBoundingClientRect()

  // INVERT: calculate and apply inverse transform
  const deltaX = first.left - last.left
  const deltaY = first.top - last.top
  const deltaW = first.width / last.width
  const deltaH = first.height / last.height

  element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`
  element.style.transformOrigin = "top left"
  element.style.transition = "none"

  // PLAY: animate to final position
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.transform = ""
      element.style.transition = "transform 300ms ease-out"
    })
  })
}
```

> **Why learn this:** Understanding FLIP helps you debug layout animation issues in Motion. When `layout` animations look wrong, it's often because the FLIP calculation is off — usually due to scroll offsets, fixed positioning, or scale transforms on parent elements.

### 9.2 Staggered Grid Reveal

```tsx
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const gridItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

const StaggeredGrid = ({ items }: { items: Item[] }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-3 gap-4"
      variants={gridContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={gridItemVariants}>
          <Card item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### 9.3 Horizontal Scroll Section

```tsx
const HorizontalScroll = ({ items }: { items: React.ReactNode[] }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(items.length - 1) * 100}%`]
  )

  return (
    <section ref={containerRef} style={{ height: `${items.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div className="flex" style={{ x }}>
          {items.map((item, index) => (
            <div key={index} className="min-w-screen h-screen flex items-center justify-center">
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

### 9.4 Parallax Card Tilt

```tsx
const ParallaxCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(x, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5
    x.set(normalizedX)
    y.set(normalizedY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  )
}
```

### 9.5 Number Counter Animation

```tsx
import { useSpring, useTransform, motion, useInView } from "motion/react"
import { useEffect, useRef } from "react"

const AnimatedCounter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { duration: duration * 1000 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  useEffect(() => {
    if (isInView) {
      spring.set(target)
    }
  }, [isInView, spring, target])

  return <motion.span ref={ref}>{rounded}</motion.span>
}
```

### 9.6 Linear Interpolation (Lerp) for Smooth Following

```tsx
// The lerp function — a one-liner that creates smooth following
const lerp = (start: number, end: number, factor: number): number =>
  start + (end - start) * factor

// Usage in requestAnimationFrame for custom cursor
const SmoothCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      // Lerp factor: 0.1 = slow follow, 0.5 = fast follow
      current.current.x = lerp(current.current.x, mouse.current.x, 0.1)
      current.current.y = lerp(current.current.y, mouse.current.y, 0.1)

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${current.current.x}px, ${current.current.y}px)`
      }

      requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", handleMouseMove)
    const frameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-6 h-6 rounded-full bg-white mix-blend-difference pointer-events-none z-50"
      style={{ transform: "translate(-50%, -50%)" }}
    />
  )
}
```

> **Trick — the lerp factor:** A lower factor (0.05-0.1) creates a dreamy, trailing effect. A higher factor (0.3-0.5) feels snappy and responsive. Use 0.1 for custom cursors and 0.05 for background parallax elements.

---

## 10. Tools & Resources

### Animation Libraries

| Library        | Best For                     | Bundle Size |
| -------------- | ---------------------------- | ----------- |
| **Motion**     | Most React animations        | ~18kb       |
| **GSAP**       | Complex timelines, ScrollTrigger | ~28kb    |
| **Lenis**      | Smooth scrolling             | ~5kb        |
| **SplitType**  | Text splitting               | ~4kb        |

### Design Tools

- [**Easing Functions Cheat Sheet**](https://easings.net/) — Visual reference for all standard easings
- [**Cubic Bezier Editor**](https://cubic-bezier.com/) — Interactive curve builder
- [**Linear() Easing Generator**](https://linear-easing-generator.netlify.app/) — Convert spring parameters to CSS `linear()` values
- [**Framer Motion Spring Generator**](https://rapidtoolset.com/en/tool/framer-motion-spring-generator) — Visualize spring configs

### Browser DevTools

- **Chrome Performance Tab** — Record and analyze animation frame rates
- **Chrome Layers Panel** — Visualize which elements are GPU-accelerated
- **Chrome Rendering → Paint Flashing** — See which areas are being repainted
- **React Profiler** — Identify unnecessary re-renders during animations

### Key Documentation

- [Motion (Framer Motion) Docs](https://motion.dev/docs/react-quick-start)
- [MDN Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [MDN CSS Scroll-Driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Josh W. Comeau — CSS linear() springs](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [Maxime Heckel — Advanced Framer Motion Patterns](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)

---

## Quick Reference: When to Use What

| Scenario                          | Use                                  |
| --------------------------------- | ------------------------------------ |
| Simple hover/focus effects        | CSS transitions                      |
| Entrance animations               | Motion `initial`/`animate`           |
| Exit animations                   | Motion `AnimatePresence` + `exit`    |
| List reordering                   | Motion `layout` prop                 |
| Shared element transitions        | Motion `layoutId`                    |
| Scroll-linked (parallax, etc.)    | Motion `useScroll` + `useTransform`  |
| Scroll-triggered (fade in)        | Motion `useInView` or CSS `view()`   |
| Page transitions (Next.js)        | View Transitions API or `AnimatePresence` |
| Complex timelines                 | GSAP `gsap.timeline()`              |
| Custom cursor / mouse follow      | `useSpring` or manual lerp + rAF    |
| Infinite/looping animations       | CSS `@keyframes` with `infinite`     |
| Spring physics                    | Motion `type: "spring"`              |
| Reduced motion support            | `prefers-reduced-motion` media query |

---

> **Final Note:** The best animations are the ones users don't consciously notice. They should make the interface feel alive and responsive without drawing attention to themselves. Master the fundamentals — easing, timing, and the 80/20 rule — before reaching for complex techniques.

---

## References

### Motion (Framer Motion) Official Documentation

All pages from [motion.dev/docs/react](https://motion.dev/docs/react):

- [Install & Quick Start](https://motion.dev/docs/react-quick-start) — Installation, import paths, first animation
- [`<motion />` Component](https://motion.dev/docs/react-motion-component) — HTML/SVG supercharged components, custom components with `motion.create()`
- [Animation](https://motion.dev/docs/react-animation) — `animate` prop, keyframes, `times` property, dynamic variants, `custom` prop
- [Transitions](https://motion.dev/docs/react-transitions) — Tween, Spring (stiffness/damping/mass), Inertia, per-property transitions, orchestration (`delayChildren`, `staggerChildren`, `when`)
- [Gestures](https://motion.dev/docs/react-gestures) — `whileHover`, `whileTap`, `whileFocus`, `whileDrag`, `whileInView`
- [Drag](https://motion.dev/docs/react-drag) — `drag`, `dragConstraints`, `dragElastic`, `dragMomentum`, `dragTransition`
- [`useDragControls`](https://motion.dev/docs/react-use-drag-controls) — Manual drag triggers, `dragControls.start()`, `snapToCursor`
- [Layout Animations](https://motion.dev/docs/react-layout-animations) — `layout`, `layoutId`, `layoutScroll`, `layoutDependency`, `layout="position"`, `layout="size"`
- [`LayoutGroup`](https://motion.dev/docs/react-layout-group) — Namespacing `layoutId`, coordinating sibling animations
- [`AnimatePresence`](https://motion.dev/docs/react-animate-presence) — Exit animations, modes (`sync`, `wait`, `popLayout`), `initial`, `onExitComplete`, `forwardRef` requirement for `popLayout`
- [`AnimateActivity`](https://motion.dev/docs/react-animate-activity) — `display: none` toggling with exit animations (Motion+ Early Access, requires React 19.2+)
- [Scroll Animations](https://motion.dev/docs/react-scroll-animations) — Scroll-linked and scroll-triggered overview
- [`useScroll`](https://motion.dev/docs/react-use-scroll) — `scrollX`, `scrollY`, `scrollXProgress`, `scrollYProgress`, `target`, `container`, `offset` (pixels, percent, viewport units)
- [`useInView`](https://motion.dev/docs/react-use-in-view) — Viewport detection, `amount` (`"some"`, `"all"`, number), `margin`, `once`, `root`
- [Motion Values](https://motion.dev/docs/react-motion-value) — Composable, signal-like values, `.set()`, `.get()`, no re-renders
- [`useMotionValue`](https://motion.dev/docs/react-motion-value) — Manual creation, injection via `style`, syncing across components
- [`useMotionValueEvent`](https://motion.dev/docs/react-use-motion-value-event) — Events: `"change"`, `"animationStart"`, `"animationComplete"`, `"animationCancel"`
- [`useTransform`](https://motion.dev/docs/react-motion-value) — Range mapping, chaining, custom transform functions
- [`useSpring`](https://motion.dev/docs/react-motion-value) — Physics-based following, stiffness/damping config, `.set()` target
- [`useVelocity`](https://motion.dev/docs/react-use-velocity) — Derived velocity tracking for physics-responsive animations
- [`useMotionTemplate`](https://motion.dev/docs/react-use-motion-template) — Tagged template literals combining motion values into CSS strings
- [`useAnimate`](https://motion.dev/docs/react-use-animate) — Imperative animation, scoped selectors, automatic cleanup, timeline sequences, `at` option, playback controls (`speed`, `pause()`, `play()`, `stop()`)
- [`stagger`](https://motion.dev/docs/stagger) — Dynamic delay function, `from` (`"first"`, `"center"`, `"last"`, index), `startDelay`
- [Reorder](https://motion.dev/docs/react-reorder) — `Reorder.Group` (`axis`, `values`, `onReorder`), `Reorder.Item` (`value`), built-in layout animations
- [`MotionConfig`](https://motion.dev/docs/react-motion-config) — Global `transition`, `reducedMotion` (`"user"`, `"always"`, `"never"`), `nonce` for CSP
- [Accessibility](https://motion.dev/docs/react-accessibility) — `reducedMotion` config, `useReducedMotion` hook, `whileTap` keyboard accessibility
- [`ScrambleText`](https://motion.dev/docs/react-scramble-text) — Text scramble animation component (Motion+ premium), `duration`, `active`, `delay`, `chars`
- [Upgrade Guide](https://motion.dev/docs/react-upgrade-guide) — Migration from `framer-motion` to `motion/react`

### Video Transcriptions

- **"My Top 5 Techniques for Web Animation"** — Transcription of a video by a web animation studio developer covering the Pareto Principle (80/20 rule) of web animation: scroll tracking, viewport detection, CSS sticky position, easing/motion design, and text splitting. Also covers bonus techniques: the mathematical map function, linear interpolation (lerp), and shaders. *(Local file: `animation/doc.txt` for source links)*

### Articles & Blog Posts

- [Advanced Animation Patterns with Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) — Maxime Heckel — Propagation, AnimatePresence, layout animations, shared layouts, LayoutGroup
- [Everything about Framer Motion Layout Animations](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/) — Maxime Heckel — Deep dive into `layout`, `layoutId`, `LayoutGroup`, `Reorder`, distortion fixes, combined patterns
- [The Physics Behind Spring Animations](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/) — Maxime Heckel — Stiffness, damping, mass explained with interactive demos
- [Springs and Bounces in Native CSS](https://www.joshwcomeau.com/animation/linear-timing-function/) — Josh W. Comeau — CSS `linear()` timing function, spring generation, design tokens, interruption limitations
- [Animating the Unanimatable (FLIP in React)](https://www.joshwcomeau.com/react/animating-the-unanimatable/) — Josh W. Comeau — Manual FLIP implementation, `getBoundingClientRect`, double rAF trick
- [Accessible Animations in React](https://www.joshwcomeau.com/react/prefers-reduced-motion/) — Josh W. Comeau — `usePrefersReducedMotion` hook, CSS media query patterns
- [Animating Layouts with the FLIP Technique](https://css-tricks.com/animating-layouts-with-the-flip-technique/) — CSS-Tricks — FLIP algorithm, Web Animations API, Flipping.js library
- [CSS GPU Animation: Doing It Right](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — Smashing Magazine — Composite layers, `will-change`, GPU memory management
- [Boost CSS Performance with will-change and translate3d](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/) — Lexo — GPU acceleration best practices, layer promotion, performance warnings
- [Best Practices for Optimizing Web Performance with Complex Animations in React](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react) — ZigPoll — Browser rendering pipeline, `useRef` vs `useState`, layout thrashing, Web Workers
- [Why Framer Motion Exit Animations Fail](https://medium.com/javascript-decoded-in-plain-english/understanding-animatepresence-in-framer-motion-attributes-usage-and-a-common-bug-914538b9f1d3) — JS Decoded — Fragment bug, AnimatePresence placement, key requirements
- [Resolving Framer Motion Compatibility in Next.js 14](https://medium.com/@dolce-emmy/resolving-framer-motion-compatibility-in-next-js-14-the-use-client-workaround-1ec82e5a0c75) — Eman Yassin — "use client" wrapper pattern, `forwardRef`, `HTMLMotionProps`
- [Advanced Page Transitions with Next.js and Framer Motion](https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion/) — LogRocket — App Router limitations, `usePathname` key pattern
- [Framer Motion Scroll Animations Guide](https://jb.desishub.com/blog/framer-motion) — JB DesisHub — `useScroll`, `useInView`, parallax, horizontal scroll, TypeScript examples
- [Build a Smooth Parallax Scroll with Framer Motion and Lenis](https://blog.olivierlarose.com/tutorials/smooth-parallax-scroll) — Olivier Larose — Lenis + Motion integration, parallax patterns

### CSS Animation References

- [MDN CSS Scroll-Driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) — `scroll()`, `view()`, `animation-timeline`, `animation-range`
- [MDN @keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@keyframes) — Keyframe syntax, interpolation, fill modes
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — Media query syntax, accessibility guidelines
- [Easing Functions Cheat Sheet](https://easings.net/) — Visual reference for all standard and custom easing curves
- [Cubic-Bezier Editor](https://cubic-bezier.com/) — Interactive cubic-bezier curve builder
- [CSS Animation Using cubic-bezier() for Spring Effects](https://www.pyxofy.com/css-animation-using-cubic-bezier-for-anticipation-and-spring-effects/) — Pyxofy — Overshoot, bounce, anticipation curves

### Libraries & Tools

- [Motion (GitHub)](https://github.com/motiondivision/motion) — Source code, issues, changelog
- [Lenis Smooth Scroll (GitHub)](https://github.com/darkroomengineering/lenis) — Smooth scroll library, React integration
- [SplitType (GitHub)](https://github.com/lukePeavey/SplitType) — Text splitting for animation, lines/words/characters
- [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/) — Premium text splitting with `aria-label` accessibility
- [next-view-transitions](https://github.com/shuding/next-view-transitions) — CSS View Transitions API for Next.js App Router
- [next-transition-router](https://github.com/ismamz/next-transition-router) — Custom animated transitions for Next.js App Router

### Next.js Official Documentation

- [viewTransition config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition) — Enabling experimental View Transitions API
- [App Router page transition discussion](https://github.com/vercel/next.js/discussions/42658) — Community discussion on animation approaches

### GitHub Issues (Common Bugs)

- [#493 — AnimatePresence exit not working](https://github.com/motiondivision/motion/issues/493) — Key requirements, placement rules
- [#1155 — Layout animation flickering](https://github.com/motiondivision/motion/issues/1155) — `layoutScroll`, inline styles fix
- [#1983 — AnimatePresence + layout animations](https://github.com/motiondivision/motion/issues/1983) — `popLayout` mode solution
- [#2411 — Exit not working in Next.js App Router](https://github.com/motiondivision/motion/issues/2411) — `usePathname` key workaround
- [#2616 — Blinking with layoutId + AnimatePresence](https://github.com/motiondivision/motion/issues/2616) — `popLayout` and `layoutScroll` fixes
- [#49279 — App Router + shared layout animations](https://github.com/vercel/next.js/issues/49279) — Next.js-specific layout animation issues
