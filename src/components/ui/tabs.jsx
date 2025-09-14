import * as React from "react"

const Tabs = ({ value, onValueChange, children, className, ...props }) => {
  return (
    <div className={className} {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  )
}

const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className, onValueChange, ...props }) => {
  const handleClick = () => {
    onValueChange?.(value)
  }

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className, ...props }) => {
  const currentValue = props.value
  if (currentValue !== value) return null

  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }