"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * next/link, prefetching when the reader shows intent (pointer over the link, a touch, keyboard focus) instead of
 * whenever it scrolls into view. Next prefetches a whole static page per visible link, so scrolling the Catch up
 * list downloaded about 2 MB of pages no one had asked for. `prefetch={false}` still turns prefetching off.
 */
export default function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  const warm = () => {
    if (prefetch !== false && typeof props.href === "string" && props.href.startsWith("/")) router.prefetch(props.href);
  };
  return (
    <NextLink
      {...props}
      prefetch={false}
      onMouseEnter={(e) => (warm(), onMouseEnter?.(e))}
      onTouchStart={(e) => (warm(), onTouchStart?.(e))}
      onFocus={(e) => (warm(), onFocus?.(e))}
    />
  );
}
