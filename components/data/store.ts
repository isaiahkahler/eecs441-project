import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from 'firebase/auth'


interface GameState {
  participants: string[],
  expiration: number,
  queue: string[],
  exitQueue: string[],
  owner: string
}

interface GlobalState {
  // classCode: string | null,
  // setClassCode: (code: string) => void,
  user: User | null
  setUser: (user: User | null) => void,
  passcode: string | null,
  setPasscode: (passcode: string | null) => void
}

export const useStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        // classCode: null,
        // setClassCode: (code) => set((state) => ({ classCode: code })),
        user: null,
        setUser: (_user) => set((state) => ({user: _user})),
        passcode: null,
        setPasscode: (_passcode) => set((state) => ({passcode: _passcode})),
      }),
      {
        name: 'session-storage',
      }
    )
  )
)