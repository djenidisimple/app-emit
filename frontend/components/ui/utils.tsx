'use client'
import { createContext, useContext } from 'react'
import { css, cx } from 'styled-system/css'

export function createStyleContext(recipe: any) {
  const StyleContext = createContext<Record<string, string>>({})

  function withProvider<P extends { className?: string }>(
    Component: React.ComponentType<any>,
    slot: string,
  ) {
    return function WithProvider(props: P) {
      const { className, ...rest } = props as any
      const styles = recipe(rest)
      return (
        <StyleContext.Provider value={styles}>
          <Component {...rest} className={cx(styles[slot], className)} />
        </StyleContext.Provider>
      )
    }
  }

  function withContext<P extends { className?: string }>(
    Component: React.ComponentType<any>,
    slot: string,
  ) {
    return function WithContext(props: P) {
      const ctx = useContext(StyleContext)
      const { className, ...rest } = props as any
      return <Component {...rest} className={cx(ctx[slot] || '', className)} />
    }
  }

  return { withProvider, withContext }
}
