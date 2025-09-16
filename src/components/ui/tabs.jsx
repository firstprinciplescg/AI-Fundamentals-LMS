import * as React from "react"

const Tabs = ({ value, onValueChange, children, className, ...props }) => {
  return (
    <div className={className} {...props}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null
        return React.cloneElement(child, { currentValue: value, onValueChange })
      })}
    </div>
  )
}

const TabsList = ({ children, className, ...props }) => {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 ${className || ''}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null
        return React.cloneElement(child, child.props)
      })}
    </div>
  )
}

const TabsTrigger = ({ value, children, className, onValueChange, currentValue, ...props }) => {
  const handleClick = () => {
    onValueChange?.(value)
  }

  const isActive = currentValue === value

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-gray-900 shadow border'
          : 'hover:bg-gray-50 text-gray-600'
      } ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, currentValue, children, className, ...props }) => {
  if (currentValue !== value) return null

  return (
    <div
      className={`mt-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }