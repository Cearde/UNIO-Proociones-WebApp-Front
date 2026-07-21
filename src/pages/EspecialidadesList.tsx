import React, { useEffect, useState } from 'react'
import axios from 'axios'

type Especialidad = {
  id?: string
  nombre: string
  activo: boolean
}

const emptyForm = (): Especialidad => ({ nombre: '', activo: true })

export default function EspecialidadesList() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [form, setForm] = useState<Especialidad>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEspecialidades()
  }, [])

  async function fetchEspecialidades() {
    try {
      const res = await axios.get('/api/especialidades')
      setEspecialidades(res.data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las especialidades.')
    }
  }

  function resetForm() {
    setForm(emptyForm())
    setEditingId(null)
    setError('')
  }

  function handleEdit(especialidad: Especialidad) {
    setEditingId(especialidad.id ?? null)
    setForm({ ...especialidad })
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      if (editingId) {
        await axios.put(`/api/especialidades/${editingId}`, form)
      } else {
        await axios.post('/api/especialidades', form)
      }

      await fetchEspecialidades()
      resetForm()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar la especialidad.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!window.confirm('¿Deseas desactivar esta especialidad?')) return

    try {
      await axios.delete(`/api/especialidades/${id}`)
      await fetchEspecialidades()
    } catch (err) {
      console.error(err)
      setError('No se pudo desactivar la especialidad.')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Mantenedor de Especialidades</h2>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Activa
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar especialidad' : 'Crear especialidad'}
          </button>
          <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {editingId ? 'Cancelar edición' : 'Limpiar'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {especialidades.map((item) => (
              <tr key={item.id} className="border-t text-sm">
                <td className="px-4 py-3">{item.nombre}</td>
                <td className="px-4 py-3">{item.activo ? 'Activa' : 'Inactiva'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Desactivar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
