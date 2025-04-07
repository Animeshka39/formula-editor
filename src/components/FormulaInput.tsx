import { useFormulaStore } from '../store/formulaStore'
import { useAutocomplete } from '../hooks/useAutocomplete'
import { useState } from 'react'

type Suggestion = {
  id: string
  name: string
  category: string
  value: string
}

export default function FormulaInput() {
  const { formula, addItem, removeItem } = useFormulaStore()
  const { data = [] } = useAutocomplete()
  const suggestions = data as Suggestion[]
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const trimmed = inputValue.trim()
      const match = suggestions.find((s: Suggestion) => s.name === trimmed)
      if (match) {
        addItem({ type: 'tag', ...match })
      } else if (/^[\d]+$/.test(trimmed)) {
        addItem({ type: 'number', value: trimmed })
      } else if (/^[+\-*/^()]$/.test(trimmed)) {
        addItem({ type: 'operator', value: trimmed })
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '') {
      removeItem(formula.length - 1)
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded bg-white shadow w-[500px]">
      <div className="flex flex-wrap gap-2">
        {formula.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
          >
            {item.type === 'tag' && (
              <>
                <span className="text-blue-600 font-semibold">{item.name}</span>
                <select className="ml-2 text-sm">
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
          className="min-w-[100px] outline-none p-1"
          placeholder="Type..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {inputValue && (
        <div className="relative">
          <div className="absolute left-0 mt-1 w-full bg-white border rounded shadow z-10">
            {suggestions
              .filter((s: Suggestion) =>
                s.name.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((item: Suggestion) => (
                <div
                  key={item.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => {
                    addItem({ type: 'tag', ...item })
                    setInputValue('')
                  }}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.category})
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
