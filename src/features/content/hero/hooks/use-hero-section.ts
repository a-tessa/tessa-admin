import { useQuery } from '@tanstack/react-query'
import { heroSectionQuery } from '../hero.queries'

export function useHeroSection() {
  return useQuery(heroSectionQuery())
}
