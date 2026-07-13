'use client'
import { createContext, useContext } from 'react'

const cx = (...args: (string | undefined | null | false)[]) => args.filter(Boolean).join(' ')

export function createStyleContext(recipe: (props: any) => Record<string, string>) {
  const StyleContext = createContext<Record<string, string>>({})

  function withProvider<P extends { className?: string }>(
    Component: React.ComponentType<any>,
    slot: string,
  ) {
    return function WithProvider(props: P) {
      const { className, ...rest } = props as unknown as P;
      const styles = recipe(rest);
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
      const { className, ...rest } = props as unknown as P;
      return <Component {...rest} className={cx(ctx[slot] || '', className)} />
    }
  }

  return { withProvider, withContext }
}
