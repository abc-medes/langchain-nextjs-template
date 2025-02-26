import { Message } from "ai";
import { create } from "zustand";

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
}

interface ThreadState {
  threads: Record<string, Thread>;
  addThread: (id: string, title: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  removeThread: (id: string) => void;
}

const useThreadStore = create<ThreadState>((set) => ({
  threads: {},

  addThread: (id, title) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [id]: { id, title, messages: [] },
      },
    })),

  addMessage: (threadId, message) =>
    set((state) => {
      const thread = state.threads[threadId];
      if (!thread) return state;
      return {
        threads: {
          ...state.threads,
          [threadId]: {
            ...thread,
            messages: [...thread.messages, message],
          },
        },
      };
    }),

  removeThread: (id) =>
    set((state) => {
      const { [id]: _, ...restThreads } = state.threads;
      return { threads: restThreads };
    }),
}));

export default useThreadStore;
