import React, { useEffect, useState } from 'react'
//import axios from 'axios'
import api from '../api/axios';

type Medico = {
  id?: string
  nombre: string
  apellido: string
  especialidades: string[]
  licenciaMedica: string
  contacto: { email: string; telefono: string }
  activo: boolean
}

type EspecialidadOption = {
  id?: string
  nombre: string
}

const emptyForm = (): Medico => ({
  nombre: '',
  apellido: '',
  especialidades: [],
  licenciaMedica: '',
  contacto: { email: '', telefono: '' },
  activo: true,
})

export default function MedicosList() {
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<EspecialidadOption[]>([])
  const [form, setForm] = useState<Medico>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMedicos()
    fetchEspecialidades()
  }, [])

  async function fetchMedicos() {
    try {
      const res = await api.get('/api/medicos')
      setMedicos(res.data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los médicos.')
    }
  }

  async function fetchEspecialidades() {
    try {
      const res = await api.get('/api/especialidades')
      setEspecialidades(res.data)
    } catch (err) {
      console.error(err)
      setEspecialidades([])
    }
  }

  function resetForm() {
    setForm(emptyForm())
    setEditingId(null)
    setError('')
  }

  function handleEdit(medico: Medico) {
    setEditingId(medico.id ?? null)
    setForm({
      ...medico,
      contacto: { ...medico.contacto },
    })
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        contacto: {
          email: form.contacto.email.trim(),
          telefono: form.contacto.telefono.trim(),
        },
      }

      if (editingId) {
        await api.put(`/api/medicos/${editingId}`, payload)
      } else {
        await api.post('/api/medicos', payload)
      }

      await fetchMedicos()
      resetForm()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el médico.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!window.confirm('¿Deseas desactivar este médico?')) return

    try {
      await api.delete(`/api/medicos/${id}`)
      await fetchMedicos()
    } catch (err) {
      console.error(err)
      setError('No se pudo desactivar el médico.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mantenedor de Médicos</h2>
        <button
          onClick={resetForm}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {editingId ? 'Cancelar edición' : 'Limpiar formulario'}
        </button>
      </div>

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
          <div>
            <label className="mb-1 block text-sm font-medium">Apellido</label>
            <input
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Especialidades</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 p-3">
              {especialidades.map((especialidad) => {
                const checked = form.especialidades.includes(especialidad.id ?? '')
                return (
                  <label key={especialidad.id ?? especialidad.nombre} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const selectedId = especialidad.id ?? ''
                        const next = checked
                          ? form.especialidades.filter((item) => item !== selectedId)
                          : [...form.especialidades, selectedId]
                        setForm({ ...form, especialidades: next })
                      }}
                    />
                    {especialidad.nombre}
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Licencia médica</label>
            <input
              value={form.licenciaMedica}
              onChange={(e) => setForm({ ...form, licenciaMedica: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.contacto.email}
              onChange={(e) => setForm({ ...form, contacto: { ...form.contacto, email: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Teléfono</label>
            <input
              value={form.contacto.telefono}
              onChange={(e) => setForm({ ...form, contacto: { ...form.contacto, telefono: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
          />
          Médico activo
        </label>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar médico' : 'Crear médico'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Especialidad</th>
              <th className="px-4 py-3">Licencia</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.id} className="border-t text-sm">
                <td className="px-4 py-3">{m.nombre} {m.apellido}</td>
                <td className="px-4 py-3">{m.especialidades?.map((id) => especialidades.find((item) => item.id === id)?.nombre || id).join(', ') || 'Sin especialidades'}</td>
                <td className="px-4 py-3">{m.licenciaMedica}</td>
                <td className="px-4 py-3">{m.contacto?.email} / {m.contacto?.telefono}</td>
                <td className="px-4 py-3">{m.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Desactivar
                    </button>
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
