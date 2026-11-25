import { useEffect, useState } from 'preact/hooks'
import type { Item } from '../shared/schemas'
import { api } from './api'

export function App() {
  const [items, setItems] = useState<Item[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Allgemein')
  const [error, setError] = useState('')

  const reload = () =>
    api
      .list()
      .then(setItems)
      .catch((e: Error) => setError(e.message))

  useEffect(() => {
    reload()
  }, [])

  async function add(e: Event) {
    e.preventDefault()
    try {
      await api.create({ title, category, note: '', rating: 3 })
      setTitle('')
      setCategory('Allgemein')
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function toggle(item: Item) {
    await api.update(item.id, { done: !item.done })
    await reload()
  }

  async function remove(item: Item) {
    await api.remove(item.id)
    await reload()
  }

  return (
    <main class="mx-auto max-w-2xl p-6">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📚</span>
        <h1 class="text-3xl font-bold text-brand">Hausaufgaben-Planer</h1>
      </div>
      <p class="mb-6 text-slate-600">
        Trage deine Hausaufgaben ein, markiere sie als erledigt und lösche Einträge, die du nicht mehr brauchst.
      </p>

      {error && (
        <p role="alert" class="mb-4 rounded bg-red-100 border border-red-200 p-3 text-red-800 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={add} class="my-6 flex flex-col sm:flex-row gap-3">
        <input
          class="flex-1 rounded border border-slate-300 p-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="z. B. Mathe-Aufgaben Seite 42"
          value={title}
          onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          required
        />
        <input
          class="w-40 rounded border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Kategorie"
          value={category}
          onInput={(e) => setCategory((e.target as HTMLInputElement).value)}
        />
        <button
          class="rounded bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        >
          Hinzufügen
        </button>
      </form>

      <ul class="space-y-3">
        {items.map((item) => (
          <li key={item.id} class="flex items-center gap-3 rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item)}
              class="rounded text-brand focus:ring-brand"
            />
            <div class="flex-1">
              <span class="text-xs uppercase tracking-wide text-slate-500">{item.category}</span>
              <h2 class={item.done ? 'font-semibold line-through text-slate-500' : 'font-semibold text-slate-900'}>
                {item.title}
              </h2>
              {item.note && <p class="text-sm text-slate-600">{item.note}</p>}
            </div>
            <button
              class="text-red-600 hover:text-red-800 hover:underline font-medium"
              onClick={() => remove(item)}
              aria-label={`„${item.title}“ löschen`}
            >
              Löschen
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            Noch keine Hausaufgaben eingetragen – leg einfach eine neue an!
          </li>
        )}
      </ul>

      <p class="mt-6 text-xs text-slate-400">
        Tipp: Jeder Klick löst einen API-Aufruf aus (POST/PATCH/DELETE). Im Netzwerk-Reiter (F12) kannst du die Aufrufe prüfen.
      </p>
    </main>
  )
}
