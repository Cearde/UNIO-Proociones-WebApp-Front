import React, { useEffect, useState } from 'react'
import axios from 'axios'

type Medico = {
  id?: string
  nombre: string
  apellido: string
  especialidades: string[]
  licenciaMedica: string
  contacto: { email: string; telefono: string }
  activo: boolean
}

type Medicamento = {
  id?: string
  nombre_comercial: string
  principio_activo: string
  laboratorio: string
  presentacion: string
  activo: boolean
}

type CodigoPromocional = {
  id?: string
  medicamento?: Medicamento
  medico?: Medico
  cantidadCupones: number
  porcentajeDescuento: number
  fechaVencimiento?: string
}

function normalizeMedico(value: any): Medico {
  return {
    id: value?.id ?? value?._id ?? value?.Id,
    nombre: value?.nombre ?? '',
    apellido: value?.apellido ?? '',
    especialidades: Array.isArray(value?.especialidades) ? value.especialidades : [],
    licenciaMedica: value?.licenciaMedica ?? '',
    contacto: {
      email: value?.contacto?.email ?? '',
      telefono: value?.contacto?.telefono ?? '',
    },
    activo: value?.activo ?? true,
  }
}

function normalizeMedicamento(value: any): Medicamento {
  return {
    id: value?.id ?? value?._id ?? value?.Id,
    nombre_comercial: value?.nombre_comercial ?? value?.nombreComercial ?? '',
    principio_activo: value?.principio_activo ?? value?.principioActivo ?? '',
    laboratorio: value?.laboratorio ?? '',
    presentacion: value?.presentacion ?? '',
    activo: value?.activo ?? true,
  }
}

function normalizeCodigo(value: any): CodigoPromocional {
  return {
    id: value?.id ?? value?._id ?? value?.Id,
    medicamento: value?.medicamento ? normalizeMedicamento(value.medicamento) : undefined,
    medico: value?.medico ? normalizeMedico(value.medico) : undefined,
    cantidadCupones: Number(value?.cantidadCupones ?? value?.cantidad_cupones ?? 0),
    porcentajeDescuento: Number(value?.porcentajeDescuento ?? value?.porcentaje_descuento ?? 0),
    fechaVencimiento: value?.fechaVencimiento ?? value?.fecha_vencimiento ?? '',
  }
}

function toDateInputValue(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const emptyForm = (): CodigoPromocional => ({
  medicamento: undefined,
  medico: undefined,
  cantidadCupones: 0,
  porcentajeDescuento: 0,
  fechaVencimiento: '',
})

export default function CodigosPromocionalesList() {
  const [codigos, setCodigos] = useState<CodigoPromocional[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [form, setForm] = useState<CodigoPromocional>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCodigos()
    fetchMedicos()
    fetchMedicamentos()
  }, [])

  async function fetchCodigos() {
    try {
      const res = await axios.get('/api/codigospromocionales')
      const payload = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      setCodigos(payload.map(normalizeCodigo))
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los códigos promocionales.')
    }
  }

  async function fetchMedicos() {
    try {
      const res = await axios.get('/api/medicos')
      const payload = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      setMedicos(payload.map(normalizeMedico))
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchMedicamentos() {
    try {
      const res = await axios.get('/api/medicamentos')
      const payload = Array.isArray(res.data) ? res.data : res.data?.data ?? []
      setMedicamentos(payload.map(normalizeMedicamento))
    } catch (err) {
      console.error(err)
    }
  }

  function resetForm() {
    setForm(emptyForm())
    setEditingId(null)
    setError('')
  }

  function handleEdit(codigo: CodigoPromocional) {
    setEditingId(codigo.id ?? null)
    setForm({
      ...codigo,
      fechaVencimiento: toDateInputValue(codigo.fechaVencimiento),
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
        fechaVencimiento: form.fechaVencimiento ? new Date(`${form.fechaVencimiento}T00:00:00`).toISOString() : null,
        medicamento: form.medicamento?.id ? form.medicamento : undefined,
        medico: form.medico?.id ? form.medico : undefined,
      }

      if (editingId) {
        await axios.put(`/api/codigospromocionales/${editingId}`, payload)
      } else {
        await axios.post('/api/codigospromocionales', payload)
      }

      await fetchCodigos()
      resetForm()
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el código promocional.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!window.confirm('¿Deseas eliminar este código promocional?')) return

    try {
      await axios.delete(`/api/codigospromocionales/${id}`)
      await fetchCodigos()
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el código promocional.')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Cupones promocionales</h2>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Medicamento</label>
            <select value={form.medicamento?.id ?? ''} onChange={(e) => {
              const selected = medicamentos.find((m) => m.id === e.target.value)
              setForm({ ...form, medicamento: selected })
            }} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">Selecciona un medicamento</option>
              {medicamentos.map((medicamento) => (
                <option key={medicamento.id} value={medicamento.id}>{medicamento.nombre_comercial}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Médico</label>
            <select value={form.medico?.id ?? ''} onChange={(e) => {
              const selected = medicos.find((m) => m.id === e.target.value)
              setForm({ ...form, medico: selected })
            }} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="">Selecciona un médico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>{medico.nombre} {medico.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cantidad de cupones</label>
            <input type="number" min="0" value={form.cantidadCupones} onChange={(e) => setForm({ ...form, cantidadCupones: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">% de descuento</label>
            <input type="number" min="0" step="0.01" value={form.porcentajeDescuento} onChange={(e) => setForm({ ...form, porcentajeDescuento: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Fecha de vencimiento</label>
            <input type="date" value={form.fechaVencimiento ?? ''} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar cupón' : 'Crear cupón'}
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
              <th className="px-4 py-3">Medicamento</th>
              <th className="px-4 py-3">Médico</th>
              <th className="px-4 py-3">Cupones</th>
              <th className="px-4 py-3">% Desc.</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {codigos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  No hay cupones promocionales para mostrar.
                </td>
              </tr>
            ) : (
              codigos.map((codigo) => (
                <tr key={codigo.id} className="border-t text-sm">
                  <td className="px-4 py-3">{codigo.medicamento?.nombre_comercial ?? '-'}</td>
                  <td className="px-4 py-3">{codigo.medico ? `${codigo.medico.nombre} ${codigo.medico.apellido}` : '-'}</td>
                  <td className="px-4 py-3">{codigo.cantidadCupones}</td>
                  <td className="px-4 py-3">{codigo.porcentajeDescuento}%</td>
                  <td className="px-4 py-3">{codigo.fechaVencimiento ? new Date(codigo.fechaVencimiento).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(codigo)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Editar</button>
                      <button onClick={() => handleDelete(codigo.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
