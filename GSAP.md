# GSAP Implementation Plan for InvestmentAnalysis.tsx

This document outlines the plan to integrate GSAP (GreenSock Animation Platform) into the `InvestmentAnalysis.tsx` component to enhance user experience with interactive, scroll-based animations without breaking existing functionalities.

## 1. Prerequisites

*   **GSAP Installed:** Confirmed that GSAP is installed in the `/frontend` directory.
    ```bash
    # If not already done:
    # npm install gsap
    # or
    # yarn add gsap
    ```
*   **Target Component:** `frontend/components/InvestmentAnalysis.tsx`

## 2. Core Strategy: `useRef`, `useEffect`, and `ScrollTrigger`

The primary approach will involve:

*   **`useRef`:** To get direct references to the DOM elements (cards, sections, specific data points) that need to be animated.
*   **`useEffect`:** To set up GSAP animations and ScrollTrigger instances once the component has mounted and the DOM elements are available. This hook will also be crucial for cleanup.
*   **`gsap.registerPlugin(ScrollTrigger)`:** To enable the ScrollTrigger functionality. This should be done once, typically at a higher level in your application or at the top of the component file.
*   **Cleanup:** In the `useEffect` return function, all created ScrollTriggers and GSAP instances must be properly killed/reverted to prevent memory leaks and unexpected behavior when the component unmounts or re-renders.
    ```javascript
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      // If using GSAP context for easier cleanup:
      // context.revert(); 
    };
    ```

## 3. Step-by-Step Implementation

### Step 3.1: Import GSAP and ScrollTrigger

At the top of `InvestmentAnalysis.tsx`:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useLayoutEffect } from 'react'; // Ensure all necessary hooks are imported

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
```
*Note: Consider `useLayoutEffect` instead of `useEffect` for animations to avoid flashes of unstyled content, as `useLayoutEffect` runs synchronously after all DOM mutations.*

### Step 3.2: Identify Target Elements and Create Refs

Go through the `InvestmentAnalysis.tsx` JSX and identify key sections/cards to animate. For each, create a `useRef`:

```typescript
// Inside the InvestmentAnalysis component
const mainContentRef = useRef<HTMLDivElement>(null); // For the overall container if needed
const propertyDetailsCardRef = useRef<HTMLDivElement>(null);
const financialAnalysisCardRef = useRef<HTMLDivElement>(null);
const nearbyAmenitiesSectionRef = useRef<HTMLDivElement>(null);
const locationAssessmentCardRef = useRef<HTMLDivElement>(null);
const suitabilityScoreCardRef = useRef<HTMLDivElement>(null);
const airQualityCardRef = useRef<HTMLDivElement>(null);
const localNewsCardRef = useRef<HTMLDivElement>(null);
const propertySpecsCardRef = useRef<HTMLDivElement>(null);
const environmentalSafetyCardRef = useRef<HTMLDivElement>(null);
const marketTrendsCardRef = useRef<HTMLDivElement>(null);
const socioEconomicCardRef = useRef<HTMLDivElement>(null);
const lifestyleMetricsCardRef = useRef<HTMLDivElement>(null);
const marketActivityCardRef = useRef<HTMLDivElement>(null);

// Example of attaching ref in JSX:
// <div ref={propertyDetailsCardRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
//   {/* ... content ... */}
// </div>
```

### Step 3.3: Basic "Fade-in on Scroll" for Major Cards

Start with simple, staggered fade-in animations for the main cards/sections as they enter the viewport.

```typescript
useLayoutEffect(() => {
  const animateCard = (element: HTMLDivElement | null, delay: number = 0) => {
    if (!element) return;
    gsap.fromTo(element,
      { autoAlpha: 0, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        delay,
        scrollTrigger: {
          trigger: element,
          start: "top 85%", // Trigger when 85% of the card is visible
          toggleActions: "play none none none", // Play once
          once: true, // Ensures animation only runs once
        }
      }
    );
  };

  // Animate cards with a slight stagger
  const cardsToAnimate = [
    { ref: propertyDetailsCardRef, delay: 0 },
    { ref: financialAnalysisCardRef, delay: 0.1 },
    { ref: nearbyAmenitiesSectionRef, delay: 0 },
    { ref: locationAssessmentCardRef, delay: 0.1 },
    { ref: suitabilityScoreCardRef, delay: 0.15 },
    { ref: airQualityCardRef, delay: 0 },
    { ref: localNewsCardRef, delay: 0.1 },
    { ref: propertySpecsCardRef, delay: 0 },
    { ref: environmentalSafetyCardRef, delay: 0.1 },
    { ref: marketTrendsCardRef, delay: 0 },
    { ref: socioEconomicCardRef, delay: 0 },
    { ref: lifestyleMetricsCardRef, delay: 0.1 },
    { ref: marketActivityCardRef, delay: 0.15 },
  ];

  cardsToAnimate.forEach(card => animateCard(card.ref.current, card.delay));

  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, []); // Empty dependency array: runs once on mount
```

### Step 3.4: Interactive Elements (Example: Number Counters)

For numerical data points (e.g., scores, percentages, currency values), implement a count-up animation when they scroll into view.

```typescript
// Helper function for number counting
const animateCountUp = (element: HTMLElement, endValue: number, isCurrency: boolean = false, isPercentage: boolean = false, decimals: number = 0) => {
  gsap.fromTo(element,
    { innerText: 0 },
    {
      innerText: endValue,
      duration: 1.5,
      ease: "power1.out",
      snap: { innerText: 1 }, // Snap to whole numbers if no decimals
      formatter: (value: number) => {
        const val = parseFloat(value.toFixed(decimals));
        if (isCurrency) return `€ ${val.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
        if (isPercentage) return `${val.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
        return val.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      },
      scrollTrigger: {
        trigger: element,
        start: "top 90%",
        toggleActions: "play none none none",
        once: true,
      }
    }
  );
};

// In useLayoutEffect, after card animations:
// Suppose you have refs for specific stat elements:
// const investmentScoreDisplayRef = useRef<HTMLSpanElement>(null);
// const yearlyYieldDisplayRef = useRef<HTMLParagraphElement>(null);

// if (investmentScoreDisplayRef.current && investmentScore) {
//   animateCountUp(investmentScoreDisplayRef.current, investmentScore, false, false, 0);
// }
// if (yearlyYieldDisplayRef.current && yearlyYield) {
//   // Note: formatPercentage already divides by 100. GSAP will animate the raw number.
//   // The formatter in animateCountUp should handle the final display.
//   animateCountUp(yearlyYieldDisplayRef.current, yearlyYield, false, true, 1);
// }
// Add more for other key metrics. Ensure target elements for numbers are distinct (e.g., within a <span>).
```
*Caveat for number counters:* This requires the numeric values to be directly available and potentially wrapping the text nodes in `<span>` elements with refs if they aren't already. The existing `formatCurrency` and `formatPercentage` will still be used for initial render and non-animated states. The GSAP formatter will handle the animated display.

### Step 3.5: Progress Bar Animations

Animate the various progress bars (e.g., suitability scores, AI property score, pollution indexes) when they scroll into view.

```typescript
// In useLayoutEffect:
// Example for a single progress bar (e.g., investmentScore bar)
// const investmentScoreBarRef = useRef<HTMLDivElement>(null);
// <div ref={investmentScoreBarRef} className="bg-green-500 ..." style={{ width: '0%' }}></div>

// if (investmentScoreBarRef.current && investmentScore) {
//   gsap.to(investmentScoreBarRef.current, {
//     width: `${investmentScore}%`,
//     duration: 1.5,
//     ease: "power2.out",
//     scrollTrigger: {
//       trigger: investmentScoreBarRef.current.parentElement, // Trigger based on parent container
//       start: "top 85%",
//       toggleActions: "play none none none",
//       once: true,
//     }
//   });
// }
// Repeat for other progress bars, ensuring their initial width is 0% or they are styled to be hidden initially.
```

### Step 3.6: Advanced/Optional: Parallax Effects or Scrub Animations

*   **Parallax on Property Image:** Slightly move the property image at a different scroll speed than the page.
    ```typescript
    // const propertyImageRef = useRef<HTMLImageElement>(null);
    // if (propertyImageRef.current) {
    //   gsap.to(propertyImageRef.current, {
    //     yPercent: -20, // Moves image up by 20% of its height as it scrolls
    //     ease: "none",
    //     scrollTrigger: {
    //       trigger: propertyImageRef.current.closest('.bg-white'), // Trigger on parent card
    //       start: "top bottom", // When top of card hits bottom of viewport
    //       end: "bottom top", // When bottom of card hits top of viewport
    //       scrub: true,
    //     }
    //   });
    // }
    ```
*   **Scrub Animations for Charts:** If you have simple bar charts (like the projected property value), you could animate the bars growing in height as the chart scrolls into view, linking the animation progress to the scroll progress.

## 4. Organization and Maintainability

*   **Helper Functions:** For complex or reused animations (like the card fade-in), create helper functions within the component or a separate `animations.ts` utility file if the logic grows significantly.
*   **GSAP Context:** For components with many animations, consider using `gsap.context()`. This allows for easier cleanup of all GSAP instances (tweens, ScrollTriggers) created within that context.
    ```typescript
    useLayoutEffect(() => {
      const ctx = gsap.context(() => {
        // All your GSAP/ScrollTrigger code here
        // animateCard(propertyDetailsCardRef.current);
        // ...
      }, mainContentRef); // Scope context to a main container element if desired

      return () => ctx.revert(); // Cleans up everything
    }, []);
    ```
*   **Incremental Implementation:** Apply animations section by section. Test thoroughly after each addition to ensure no conflicts or performance issues arise.

## 5. Performance Considerations

*   **`autoAlpha` vs. `opacity`:** Prefer `autoAlpha` for fade animations as it also handles `visibility: hidden`, which is more performant.
*   **`will-change` CSS property:** For elements undergoing significant transform or opacity changes, consider applying `will-change: transform, opacity;` via CSS. Use sparingly as it can consume memory.
*   **`once: true` for ScrollTrigger:** Use this for animations that only need to run once to reduce processing.
*   **Debounce/Throttle for Resize:** If animations depend on window dimensions, ensure resize handlers are debounced or throttled. ScrollTrigger often handles this internally, but be mindful if doing manual calculations.
*   **Testing:** Test on various devices and browsers, paying attention to scroll smoothness and CPU usage.

## 6. Avoiding Conflicts with Existing Logic

*   **Initial State:** GSAP animations generally start from an element's current state or a defined "from" state. Ensure this doesn't conflict with initial styles set by React or CSS. For "from" animations, elements might need to be initially hidden (e.g., `autoAlpha: 0`).
*   **State Management:** Animations should primarily be presentational. Avoid having GSAP directly manipulate React state that drives other logic, unless explicitly intended and carefully managed.
*   **CSS Transitions:** Remove or override any existing CSS transitions on elements that GSAP will animate to prevent conflicts.

## 7. Rollout Plan

1.  **Setup:** Implement Step 3.1 (Imports & Registration).
2.  **Basic Card Animations:** Implement Step 3.2 (Refs) and Step 3.3 (Basic Fade-in) for 2-3 key cards. Test thoroughly.
3.  **Expand Card Animations:** Apply to remaining cards.
4.  **Numerical Animations:** Implement Step 3.4 for key metrics.
5.  **Progress Bars:** Implement Step 3.5.
6.  **Advanced (Optional):** Consider Step 3.6 if desired and time permits.
7.  **Refactor & Optimize:** Review code for organization (Step 4) and performance (Step 5).
8.  **Final Testing:** Comprehensive testing across browsers and devices.

This plan provides a structured way to introduce engaging animations while minimizing the risk of breaking the `InvestmentAnalysis.tsx` component's core functionality. 