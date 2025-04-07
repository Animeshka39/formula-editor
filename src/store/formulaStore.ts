import { create } from 'zustand'

export type FormulaItem =
  | { type: 'tag'; id: string; name: string; category: string }
  | { type: 'operator'; value: string }
  | { type: 'number'; value: string }

type FormulaState = {
  formula: FormulaItem[]
  addItem: (item: FormulaItem, index?: number) => void
  removeItem: (index: number) => void
  updateItem: (index: number, item: FormulaItem) => void
}

export const useFormulaStore = create<FormulaState>((set) => ({
  formula: [],
  addItem: (item, index) =>
    set((state) => {
      const newFormula = [...state.formula]
      if (index !== undefined) {
        newFormula.splice(index, 0, item)
      } else {
        newFormula.push(item)
      }
      return { formula: newFormula }
    }),
  removeItem: (index) =>
    set((state) => ({
      formula: state.formula.filter((_, i) => i !== index),
    })),
  updateItem: (index, item) =>
    set((state) => {
      const newFormula = [...state.formula]
      newFormula[index] = item
      return { formula: newFormula }
    }),
}))
