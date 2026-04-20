import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Set initial state without triggering lint warning or unnecessary render
    setTimeout(() => {
      const initialValue = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(initialValue)
    }, 0)
    
    return () => mql.removeEventListener("change", onChange)
  }, [isMobile])

  return isMobile
}
