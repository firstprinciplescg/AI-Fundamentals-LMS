import * as React from "react"
import { ChevronDown } from "../icons"

const SelectContext = React.createContext()

const Select = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '')
  const [selectedLabel, setSelectedLabel] = React.useState('')
  const triggerRef = React.useRef(null)
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleValueChange = (newValue, label) => {
    setSelectedValue(newValue)
    setSelectedLabel(label)
    setIsOpen(false)
    onValueChange?.(newValue)
  }

  const contextValue = {
    value: selectedValue,
    isOpen,
    setIsOpen,
    onValueChange: handleValueChange,
    selectedLabel,
    triggerRef,
    contentRef
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  const handleClick = () => {
    context?.setIsOpen(!context.isOpen)
  }

  return (
    <button
      ref={(node) => {
        if (context) context.triggerRef.current = node
        if (ref) {
          if (typeof ref === 'function') ref(node)
          else ref.current = node
        }
      }}
      type="button"
      className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${context?.isOpen ? 'rotate-180' : ''}`} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, ...props }) => {
  const context = React.useContext(SelectContext)

  return (
    <span {...props}>
      {context?.selectedLabel || context?.value || placeholder}
    </span>
  )
}

const SelectContent = ({ children, ...props }) => {
  const context = React.useContext(SelectContext)

  if (!context?.isOpen) return null

  return (
    <div
      ref={context.contentRef}
      className="absolute z-50 top-full left-0 right-0 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg"
      {...props}
    >
      <div className="p-1 max-h-60 overflow-auto">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onSelect: context.onValueChange
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = ({ className, children, value, onSelect, ...props }) => {
  const context = React.useContext(SelectContext)

  const handleClick = () => {
    onSelect?.(value, children)
  }

  const isSelected = context?.value === value

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-900' : ''
      } ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {isSelected && (
        <div className="absolute right-2 h-3.5 w-3.5">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}