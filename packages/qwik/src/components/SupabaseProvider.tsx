import { createContext, component$, useContextProvider, Slot, QRL } from '@builder.io/qwik'
import type { SupabaseClient } from '@supabase/supabase-js'

const NAME = 'supabase'
export const SupabaseContext = createContext<QRL<() => SupabaseClient>>(NAME)

interface Props {
  client$: QRL<() => SupabaseClient>
}

export const SupabaseProvider = component$((props: Props) => {
  useContextProvider(SupabaseContext, props.client$)
  return (
    <Slot />
  )
})