import { useFormulaStore } from '../store/formulaStore'
import { useAutocomplete, Suggestion } from '../hooks/useAutocomplete'
import { useState } from 'react'

export default function FormulaInput() {
  const { formula, addItem, removeItem } = useFormulaStore()
  const { data: suggestions = [] } = useAutocomplete()
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredSuggestions = suggestions.filter((s) =>
    s.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed) return

      const match = suggestions.find((s) => s.name === trimmed)
      if (match) {
        addItem({ type: 'tag', ...match })
      } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
        addItem({ type: 'number', value: trimmed })
      } else if (/^[+\-*/^()%]$/.test(trimmed)) {
        addItem({ type: 'operator', value: trimmed })
      }

      setInputValue('')
      setShowDropdown(false)
    } else if (e.key === 'Backspace' && inputValue === '') {
      removeItem(formula.length - 1)
    }
  }

  const handleSuggestionClick = (s: Suggestion) => {
    addItem({ type: 'tag', ...s })
    setInputValue('')
    setShowDropdown(false)
  }

  const evalFormula = () => {
    const expr = formula
      .map((item) => {
        if (item.type === 'tag') {
          // Defaulting undefined tag values to 0
          return typeof item.value === 'number' ? item.value : 0
        }
        if (item.type === 'number') return parseFloat(item.value)
        if (item.type === 'operator') {
          // Handle percentage as division by 100
          return item.value === '%' ? '/ 100' : item.value
        }
        return ''
      })
      .join(' ')

    try {
      // eslint-disable-next-line no-new-func
      return Function(`return (${expr})`)()
    } catch {
      return 'Invalid formula'
    }
  }

  return (
    <div className="w-full max-w-3xl p-4">
      <div className="flex items-center border border-purple-400 rounded px-2 py-1 bg-white shadow-sm text-sm font-mono relative">
        <span className="text-purple-500 font-semibold mr-2">=</span>

        {formula.map((item, index) => (
          <div
            key={index}
            className="flex items-center mx-1 px-2 py-0.5 rounded bg-gray-100"
          >
            {item.type === 'tag' && (
              <>
                <span className="text-blue-600">{item.name}</span>
                <select className="ml-2 text-xs text-gray-700 bg-white border border-gray-300 rounded">
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </>
            )}
            {item.type === 'operator' && <span>{item.value}</span>}
            {item.type === 'number' && <span>{item.value}</span>}
          </div>
        ))}

        <input
          className="flex-1 outline-none px-1 min-w-[100px] text-gray-700"
          placeholder="Enter a formula"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowDropdown(true)
          }}
          onKeyDown={handleKeyDown}
        />

        {showDropdown && filteredSuggestions.length > 0 && (
          <div className="absolute left-10 top-full mt-1 w-72 bg-white border border-gray-300 rounded shadow z-10 max-h-40 overflow-auto">
            {filteredSuggestions.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 cursor-pointer hover:bg-purple-100"
                onClick={() => handleSuggestionClick(s)}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.category}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm font-mono text-gray-800">
        Result: <span className="font-bold">{evalFormula()}</span>
      </div>
    </div>
  )
}
