import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export type Suggestion = {
  id: string
  name: string
  category: string
  value: number | ''
}

const AUTOCOMPLETE_URL = 'https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete'

export const useAutocomplete = () => {
  return useQuery<Suggestion[]>({
    queryKey: ['autocomplete'],
    queryFn: async () => {
      const res = await axios.get<Suggestion[]>(AUTOCOMPLETE_URL)
      return res.data
    },
  })
}
