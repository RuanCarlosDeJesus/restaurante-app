import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (avisar) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', avisar)
      return () => media.removeEventListener('change', avisar)
    },
    () => window.matchMedia(query).matches,
  )
}

export function useDesktop() {
  return useMediaQuery('(min-width: 640px)')
}
