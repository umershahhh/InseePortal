'use client'
import { useEffect, useRef } from 'react'

/**
 * Attach to a container ref. All children with class "reveal"
 * get the "visible" class when they scroll into view.
 * Uses IntersectionObserver — no GSAP dependency, guaranteed to work.
 */
export function useReveal(threshold = 0.12) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const items = container.querySelectorAll('.reveal')
    if (!items.length) return

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            obs.unobserve(entry.target)   // animate once
          }
        })
      },
      { threshold }
    )

    items.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [threshold])

  return ref
}
