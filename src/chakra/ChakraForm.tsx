import { MooladharaForm } from './MooladharaForm'
import { SahasraraForm } from './SahasraraForm'

export type FormProps = {
  pulse: React.MutableRefObject<number>
  bloom: React.MutableRefObject<number>
  pointer: React.MutableRefObject<[number, number]>
  still: boolean
}

export function ChakraForm({ slug, ...props }: FormProps & { slug: string }) {
  if (slug === 'sahasrara') return <SahasraraForm {...props} />
  return <MooladharaForm {...props} />
}
