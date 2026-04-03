import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  root?: Element | null
  enabled?: boolean
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLDivElement | null>
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0.1,
    rootMargin = '200px',
    root = null,
    enabled = true
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      {
        threshold,
        rootMargin,
        root
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, root, enabled])

  return { ref, isIntersecting, entry }
}

interface UseInfiniteScrollOptions extends UseIntersectionObserverOptions {
  hasNextPage: boolean
  isFetching: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll(
  options: UseInfiniteScrollOptions
): UseIntersectionObserverReturn {
  const { hasNextPage, isFetching, onLoadMore, ...observerOptions } = options

  const { ref, isIntersecting } = useIntersectionObserver(observerOptions)

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetching) {
      onLoadMore()
    }
  }, [isIntersecting, hasNextPage, isFetching, onLoadMore])

  return { ref, isIntersecting, entry: null }
}
