import React, { useEffect, useState } from 'react'
//import axios from 'axios'
import api from '../api/axios';


type Medicamento = {
  id?: string
  nombre_comercial: string
  principio_activo: string
  laboratorio: string
  presentacion: string
  activo: boolean
}

const initialForm: Omit<Medicamento, 'id'> = {
  nombre_comercial: '',
  principio_activo: '',
  laboratorio: '',
  presentacion: '',
  activo: true,
}

export default function MedicamentosList() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [form, setForm] = useState<Omit<Medicamento, 'id'>>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMedicamentos()
  }, [])

  async function fetchMedicamentos() {
    try {
      const res = await api.get('/api/medicamentos')
      const data = Array.isArray(res.data) ? res.data : []
      setMedicamentos(data)
    } catch (err) {
      console.error('Fetch medicamentos error', err)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      if (editingId) {
        await api.put(`/api/medicamentos/${editingId}`, form)
      } else {
        await api.post('/api/medicamentos', form)
      }
      setForm(initialForm)
      setEditingId(null)
      fetchMedicamentos()
    } catch (err) {
      console.error(err)
    }
  }

  function startEdit(medicamento: Medicamento) {
    setEditingId(medicamento.id ?? null)
    setForm({
      nombre_comercial: medicamento.nombre_comercial,
      principio_activo: medicamento.principio_activo,
      laboratorio: medicamento.laboratorio,
      presentacion: medicamento.presentacion,
      activo: medicamento.activo,
    })
  }

  async function handleDeactivate(id: string) {
    try {
      await api.delete(`/api/medicamentos/${id}`)
      fetchMedicamentos()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Medicamentos</h2>
            <p className="text-sm text-gray-500">Administra tu catálogo de medicamentos.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre comercial</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principio activo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laboratorio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicamentos.map((med) => (
                <tr key={med.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{med.nombre_comercial}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{med.principio_activo}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{med.laboratorio}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">{med.activo ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => startEdit(med)} className="mr-2 text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => med.id && handleDeactivate(med.id)} className="text-red-600 hover:underline">Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar medicamento' : 'Nuevo medicamento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre comercial</label>
            <input name="nombre_comercial" value={form.nombre_comercial} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Principio activo</label>
            <input name="principio_activo" value={form.principio_activo} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Laboratorio</label>
            <input name="laboratorio" value={form.laboratorio} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Presentación</label>
            <textarea name="presentacion" value={form.presentacion} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label className="text-sm text-gray-700">Activo</label>
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">{editingId ? 'Actualizar' : 'Crear medicamento'}</button>
        </form>
      </div>
    </div>
  )
}
