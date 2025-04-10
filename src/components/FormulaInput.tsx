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

      if (/^[0-9.]+$/.test(trimmed)) {
        addItem({ type: 'number', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      else if (/^[0-9.]+%$/.test(trimmed)) {
        addItem({ type: 'percentage', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      else if (/^[+\-*/^()]$/.test(trimmed)) {
        addItem({ type: 'operator', value: trimmed }, cursorIndex)
        setCursorIndex((i) => i + 1)
      }
      else {
        const match = suggestions.find((s) => s.name === trimmed)
        if (match) {
          addItem({ type: 'tag', ...match }, cursorIndex) 
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
    addItem({ type: 'tag', ...s }, cursorIndex) 
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
        if (item.type === 'tag') return item.value || 1 
        if (item.type === 'number') return Number(item.value) 
        if (item.type === 'operator') return item.value
        if (item.type === 'percentage') return Number(item.value.replace('%', '')) / 100 
        return ''
      })
      .join(' ')
    try {
      return Function(`return (${expr})`)() 
    } catch {
      return 'Invalid formula'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
  <div className="relative flex flex-wrap items-center border border-purple-200 bg-white/60 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl transition-all min-h-[60px] font-mono text-sm">
    <span className="text-purple-600 text-lg font-bold mr-3 select-none">=</span>

    {formula.map((item, index) => (
      <div
        key={index}
        className="group flex items-center mx-1 px-4 py-1.5 rounded-full bg-gradient-to-tr from-gray-100 to-white border border-gray-200 shadow-sm transition-all hover:shadow-md cursor-pointer relative"
        onClick={() => setCursorIndex(index + 1)}
      >
        {item.type === 'tag' && (
          <>
            <span className="text-blue-700 font-semibold">{item.name}</span>
            {renderDropdown(item.id)}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeItem(index)
              }}
              className="ml-2 text-gray-400 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </>
        )}
        {item.type === 'operator' && <span className="text-gray-700">{item.value}</span>}
        {item.type === 'number' && <span className="text-green-700">{item.value}</span>}
        {item.type === 'percentage' && <span className="text-pink-600">{item.value}</span>}
      </div>
    ))}

    <input
      ref={inputRef}
      className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none px-2 py-1 min-w-[140px]"
      placeholder="Type to add..."
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value)
        setShowDropdown(true)
      }}
      onKeyDown={handleKeyDown}
    />

    {showDropdown && filteredSuggestions.length > 0 && (
      <div className="absolute left-14 top-full mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto animate-fadeIn custom-scrollbar">
        {filteredSuggestions.map((s) => (
          <div
            key={s.id}
            className="px-4 py-3 cursor-pointer hover:bg-purple-100 transition flex flex-col"
            onClick={() => handleSuggestionClick(s)}
          >
            <span className="font-semibold text-gray-800">{s.name}</span>
            <span className="text-xs text-gray-500">{s.category}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="mt-6 text-sm font-mono text-gray-900">
    <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900 font-extrabold shadow-md">
      Result: {evalFormula()}
    </div>
  </div>
</div>

  )
}
