import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import MedicosList from './pages/MedicosList'
import MedicamentosList from './pages/MedicamentosList'
import EspecialidadesList from './pages/EspecialidadesList'
import CodigosPromocionalesList from './pages/CodigosPromocionalesList'

export default function App() {
  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-4 py-3 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:flex">
        <aside className="w-full lg:w-72 border-r border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-slate-900">PromoMed Portal</h1>
            <p className="mt-2 text-sm text-slate-500">Administra médicos, medicamentos y promociones.</p>
          </div>
          <nav className="space-y-2 px-4 pb-6">
            {navItem('/', 'Dashboard')}
            {navItem('/medicos', 'Médicos')}
            {navItem('/especialidades', 'Especialidades')}
            {navItem('/codigos-promocionales', 'Códigos promocionales')}
            {navItem('/medicamentos', 'Medicamentos')}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-700 to-blue-600 px-6 py-8 text-white shadow-xl">
            <h2 className="text-3xl font-semibold">Bienvenido al Portal de Promociones</h2>
            <p className="mt-2 text-slate-200">Gestiona códigos promocionales y médicos desde un panel moderno.</p>
          </div>
          <Routes>
            <Route path="/medicos" element={<MedicosList />} />
            <Route path="/especialidades" element={<EspecialidadesList />} />
            <Route path="/codigos-promocionales" element={<CodigosPromocionalesList />} />
            <Route path="/medicamentos" element={<MedicamentosList />} />
            <Route path="/" element={<div className="rounded-3xl bg-white p-8 shadow-sm"> <h2 className="text-2xl font-semibold">Dashboard</h2> <p className="mt-2 text-slate-600">Selecciona un módulo del menú lateral para comenzar.</p> </div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
