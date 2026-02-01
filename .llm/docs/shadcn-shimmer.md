# Shimmer
An animated text shimmer component for creating eye-catching loading states and progressive reveal effects.
The `Shimmer` component provides an animated shimmer effect that sweeps across text, perfect for indicating loading states, progressive reveals, or drawing attention to dynamic content in AI applications.
This text has a shimmer effect
```
"use client";

import { Shimmer } from "@/components/ai-elements/shimmer";

const Example = () => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <Shimmer>This text has a shimmer effect</Shimmer>
    <Shimmer as="h1" className="font-bold text-4xl">
      Large Heading
    </Shimmer>
    <Shimmer duration={3} spread={3}>
      Slower shimmer with wider spread
    </Shimmer>
  </div>
);

export default Example;

```
# Large Heading
Slower shimmer with wider spread
## [Installation](https://ai-sdk.dev/elements/components/shimmer#installation)
CLI
```
npx ai-elements@latest add shimmer
```

Manual
```
"use client";

import { cn } from "@repo/shadcn-ui/lib/utils";
import { motion } from "motion/react";
import {
  type CSSProperties,
  type ElementType,
  type JSX,
  memo,
  useMemo,
} from "react";

export interface TextShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) => {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements
  );

  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread]
  );

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage:
            "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
        } as CSSProperties
      }
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);

```

## [Features](https://ai-sdk.dev/elements/components/shimmer#features)
  * Smooth animated shimmer effect using CSS gradients and Framer Motion
  * Customizable animation duration and spread
  * Polymorphic component - render as any HTML element via the `as` prop
  * Automatic spread calculation based on text length
  * Theme-aware styling using CSS custom properties
  * Infinite looping animation with linear easing
  * TypeScript support with proper type definitions
  * Memoized for optimal performance
  * Responsive and accessible design
  * Uses `text-transparent` with background-clip for crisp text rendering


## [Examples](https://ai-sdk.dev/elements/components/shimmer#examples)
### [Different Durations](https://ai-sdk.dev/elements/components/shimmer#different-durations)
```
"use client";

import { Shimmer } from "@/components/ai-elements/shimmer";

const Example = () => (
  <div className="flex flex-col gap-6 p-8">
    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">Fast (1 second)</p>
      <Shimmer duration={1}>Loading quickly...</Shimmer>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">Default (2 seconds)</p>
      <Shimmer duration={2}>Loading at normal speed...</Shimmer>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">Slow (4 seconds)</p>
      <Shimmer duration={4}>Loading slowly...</Shimmer>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">
        Very Slow (6 seconds)
      </p>
      <Shimmer duration={6}>Loading very slowly...</Shimmer>
    </div>
  </div>
);

export default Example;

```
### [Custom Elements](https://ai-sdk.dev/elements/components/shimmer#custom-elements)
```
"use client";

import { Shimmer } from "@/components/ai-elements/shimmer";

const Example = () => (
  <div className="flex flex-col gap-6 p-8">
    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">
        As paragraph (default)
      </p>
      <Shimmer as="p">This is rendered as a paragraph</Shimmer>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">As heading</p>
      <Shimmer as="h2" className="font-bold text-2xl">
        Large Heading with Shimmer
      </Shimmer>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">As span (inline)</p>
      <div>
        Processing your request{" "}
        <Shimmer as="span" className="inline">
          with AI magic
        </Shimmer>
        ...
      </div>
    </div>

    <div className="text-center">
      <p className="mb-3 text-muted-foreground text-sm">
        As div with custom styling
      </p>
      <Shimmer as="div" className="font-semibold text-lg">
        Custom styled shimmer text
      </Shimmer>
    </div>
  </div>
);

export default Example;

```
## [Props](https://ai-sdk.dev/elements/components/shimmer#props)
### [`<Shimmer />`](https://ai-sdk.dev/elements/components/shimmer#shimmer-)
Prop
Type
`children?`string
`as?`ElementType
`className?`string
`duration?`number
`spread?`number
[](https://ai-sdk.dev/elements/components/shimmer#installation)[](https://ai-sdk.dev/elements/components/shimmer#features)[](https://ai-sdk.dev/elements/components/shimmer#examples)[](https://ai-sdk.dev/elements/components/shimmer#different-durations)[](https://ai-sdk.dev/elements/components/shimmer#custom-elements)[](https://ai-sdk.dev/elements/components/shimmer#props)[`<Shimmer />`](https://ai-sdk.dev/elements/components/shimmer#shimmer-)