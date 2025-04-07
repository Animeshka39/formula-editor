import FormulaInput from './components/FormulaInput'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FormulaInput />
      </div>
    </QueryClientProvider>
  )
}

export default App
