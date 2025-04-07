import { useFormulaStore } from '../store/formulaStore'
import { useAutocomplete, Suggestion } from '../hooks/useAutocomplete'
import { useState, useRef } from 'react'

export default function FormulaInput() {
  const { formula, addItem, removeItem } = useFormulaStore()
  const { data: suggestions = [] } = useAutocomplete()
  const [inputValue, setInputValue] = useState('')
  const [cursorIndex, setCursorIndex] = useState(formula.length)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter((s) =>
    s.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed) return

      // Handle numbers (including decimals)
      if (/^[0-9.]+$/.test(trimmed)) {
        addItem({ type: 'number', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      // Handle percentage
      else if (/^[0-9.]+%$/.test(trimmed)) {
        addItem({ type: 'percentage', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      // Handle operators and parentheses
      else if (/^[+\-*/^()]$/.test(trimmed)) {
        addItem({ type: 'operator', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      // Handle suggestions (tags)
      else {
        const match = suggestions.find((s) => s.name === trimmed)
        if (match) {
          addItem({ type: 'tag', ...match }, cursorIndex) // Pass a single object
          setCursorIndex((i) => i + 1)
        }
      }

      setInputValue('')
      setShowDropdown(false)
    } else if (e.key === 'Backspace' && inputValue === '') {
      if (cursorIndex > 0) {
        removeItem(cursorIndex - 1)
        setCursorIndex((i) => i - 1)
      }
    }
  }

  const handleSuggestionClick = (s: Suggestion) => {
    addItem({ type: 'tag', ...s }, cursorIndex) // Pass a single object
    setInputValue('')
    setCursorIndex((i) => i + 1)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleDropdownChange = (tagId: string, selectedOption: string) => {
    const updatedFormula = formula.map((item) =>
      item.type === 'tag' && item.id === tagId
        ? { ...item, value: selectedOption }
        : item
    )

    // Add each updated formula item individually
    updatedFormula.forEach(item => {
      addItem(item)
    })
  }

  const renderDropdown = (tagId: string) => (
    <select
      className="ml-2 text-xs text-gray-700 bg-white border border-gray-300 rounded"
      onChange={(e) => handleDropdownChange(tagId, e.target.value)}
    >
      <option value="Option A">Option A</option>
      <option value="Option B">Option B</option>
      <option value="Option C">Option C</option>
    </select>
  )

  const evalFormula = () => {
    const expr = formula
      .map((item) => {
        if (item.type === 'tag') return item.value || 1 // Dummy value for tags
        if (item.type === 'number') return Number(item.value) // Ensure value is a number
        if (item.type === 'operator') return item.value
        if (item.type === 'percentage') return Number(item.value.replace('%', '')) / 100 // Convert percentage to number
        return ''
      })
      .join(' ')
    try {
      return Function(`return (${expr})`)() // Evaluate the formula expression
    } catch {
      return 'Invalid formula'
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
    <div className="relative flex flex-wrap items-center border border-purple-300 rounded-xl px-4 py-3 bg-white/70 backdrop-blur-md shadow-lg text-sm font-mono min-h-[56px] transition-all duration-300">
      <span className="text-purple-600 text-base font-bold mr-2 select-none">=</span>
      {formula.map((item, index) => (
        <div
          key={index}
          className="flex items-center space-x-1 mx-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer shadow-sm"
          onClick={() => setCursorIndex(index + 1)}
        >
          {item.type === 'tag' && (
            <>
              <span className="text-blue-700 font-medium">{item.name}</span>
              {renderDropdown(item.id)}
            </>
          )}
          {item.type === 'operator' && <span className="text-gray-700">{item.value}</span>}
          {item.type === 'number' && <span className="text-green-700">{item.value}</span>}
          {item.type === 'percentage' && <span className="text-pink-600">{item.value}</span>}
        </div>
      ))}
  
      <input
        ref={inputRef}
        className="flex-1 outline-none px-2 py-1 min-w-[120px] bg-transparent text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none"
        placeholder="Enter formula..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setShowDropdown(true)
        }}
        onKeyDown={handleKeyDown}
      />
  
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute left-10 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto animate-fadeIn transition-all">
          {filteredSuggestions.map((s) => (
            <div
              key={s.id}
              className="px-4 py-3 cursor-pointer hover:bg-purple-100 border-b last:border-b-0 transition"
              onClick={() => handleSuggestionClick(s)}
            >
              <div className="font-semibold text-gray-800">{s.name}</div>
              <div className="text-xs text-gray-500">{s.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  
    <div className="mt-6 text-sm font-mono text-gray-900">
      <div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200 shadow-inner text-purple-800 font-bold">
        Result: {evalFormula()}
      </div>
    </div>
  </div>
  
  )
}
