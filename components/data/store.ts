import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'


interface GameState {
  participants: string[],
  expiration: number,
  queue: string[],
  exitQueue: string[],
}

interface GlobalState {
  classCode: string | null,
  setClassCode: (code: string) => void,

}

const useStore = create<GlobalState>()(
  devtools(
    persist(
      (set) => ({
        classCode: null,
        setClassCode: (code) => set((state) => ({ classCode: code })),
      }),
      {
        name: 'session-storage',
      }
    )
  )
)