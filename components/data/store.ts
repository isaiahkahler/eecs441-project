import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from 'firebase/auth'


interface GameState {
  participants: string[],
  expiration: number,
  queue: string[],
  exitQueue: string[],
}

interface GlobalState {
  // classCode: string | null,
  // setClassCode: (code: string) => void,
  user: User | null
  setUser: (user: User | null) => void
}

export const useStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        // classCode: null,
        // setClassCode: (code) => set((state) => ({ classCode: code })),
        user: null,
        setUser: (_user) => set((state) => ({user: _user}))
      }),
      {
        name: 'session-storage',
      }
    )
  )
)