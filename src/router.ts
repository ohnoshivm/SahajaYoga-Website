import { useEffect, useState } from 'react'

/** Tiny path router: /mooladhara, /sahasrara. History API, no dependency. */
export function navigate(path: string) {
  if (path === location.pathname) return
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
}

export function usePath() {
  const [path, setPath] = useState(() => location.pathname)
  useEffect(() => {
    const on = () => setPath(location.pathname)
    addEventListener('popstate', on)
    return () => removeEventListener('popstate', on)
  }, [])
  return path
}
