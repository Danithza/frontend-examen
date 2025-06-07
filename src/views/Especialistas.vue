<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <h1 class="text-2xl font-bold mb-4">Gestión de Especialistas</h1>

    <button class="bg-green-600 text-white px-4 py-2 rounded mb-4" @click="nuevoEspecialista">
      Agregar Especialista
    </button>

    <EspecialistaForm
      v-if="mostrarFormulario"
      :modoEdicion="modoEdicion"
      :datosIniciales="especialistaSeleccionado"
      @guardar="guardarEspecialista"
      @cancelar="cancelarFormulario"
    />

    <div class="flex items-center gap-2 mb-2">
      <label>Ordenar por:</label>
      <select v-model="orderBy" class="border rounded px-2 py-1">
        <option value="nombre_completo">Nombre</option>
        <option value="especialidad">Especialidad</option>
      </select>
      <select v-model="direction" class="border rounded px-2 py-1">
        <option value="asc">Ascendente</option>
        <option value="desc">Descendente</option>
      </select>
      <button class="ml-2 px-3 py-1 bg-blue-500 text-white rounded" @click="cargarDatos">Aplicar</button>
    </div>

    <!-- Tabla de Especialistas Activos -->
    <h2 class="text-xl font-semibold mt-6">Especialistas Activos</h2>
    <table class="w-full mt-2 border">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2">Nombre</th>
          <th class="p-2">Especialidad</th>
          <th class="p-2">Registro</th>
          <th class="p-2">Días y Horarios</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in especialistasActivos" :key="e.id" class="border-t">
          <td class="p-2">{{ e.nombreCompleto }}</td>
          <td class="p-2">{{ e.especialidad }}</td>
          <td class="p-2">{{ e.registroProfesional }}</td>
          <td class="p-2">
            <div v-for="(rangos, dia) in e.diasHorarios" :key="dia">
              <strong>{{ dia }}:</strong>
              <span v-for="(rango, idx) in rangos" :key="idx">
                {{ rango.inicio }}-{{ rango.fin }}<span v-if="idx < rangos.length - 1">, </span>
              </span>
            </div>
          </td>
          <td class="p-2 space-x-2">
            <button class="text-blue-600" @click="editarEspecialista(e)">Editar</button>
            <button class="text-red-600" @click="eliminarEspecialistaClick(e.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Tabla de Especialistas Inactivos -->
    <h2 class="text-xl font-semibold mt-6">Especialistas Inactivos</h2>
    <table class="w-full mt-2 border">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-2">Nombre</th>
          <th class="p-2">Especialidad</th>
          <th class="p-2">Registro</th>
          <th class="p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in especialistasInactivos" :key="e.id" class="border-t">
          <td class="p-2">{{ e.nombreCompleto }}</td>
          <td class="p-2">{{ e.especialidad }}</td>
          <td class="p-2">{{ e.registroProfesional }}</td>
          <td class="p-2 space-x-2">
            <button class="text-green-600" @click="restaurarEspecialistaClick(e.id)">Restaurar</button>
            <button class="text-red-600" @click="eliminarDefinitivoClick(e.id)">Eliminar definitivo</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="errorMsg" class="mt-4 text-red-600">{{ errorMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EspecialistaForm from '../components/EspecialistaFormulario.vue'

import {
  ObtenerEspecialistasOrdenados,
  ObtenerEspecialistasInactivos,
  enviarEspecialista,
  ActualizarEspecialista,
  EliminarEspecialista,
  RestaurarEspecialista,
  EliminarEspecialistaDefinitivo
} from '@/service/EspecialistaService.ts'

interface RangoHorario {
  inicio: string
  fin: string
}

interface Especialista {
  id: number
  nombreCompleto: string
  especialidad: string
  registroProfesional: string
  diasHorarios: Record<string, RangoHorario[]>
}

const especialistasActivos = ref<Especialista[]>([])
const especialistasInactivos = ref<Especialista[]>([])

const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const especialistaSeleccionado = ref<Especialista | null>(null)

const orderBy = ref<'nombre_completo' | 'especialidad'>('nombre_completo')
const direction = ref<'asc' | 'desc'>('asc')

const errorMsg = ref<string>('')

const cargarDatos = async (): Promise<void> => {
  try {
    especialistasActivos.value = await ObtenerEspecialistasOrdenados(orderBy.value, direction.value)
    especialistasInactivos.value = await ObtenerEspecialistasInactivos()
    errorMsg.value = ''
  } catch (e: any) {
    errorMsg.value = 'Error al cargar los especialistas'
  }
}

onMounted(cargarDatos)

function nuevoEspecialista(): void {
  especialistaSeleccionado.value = null
  modoEdicion.value = false
  mostrarFormulario.value = true
}

function editarEspecialista(e: any): void {
  // Convierte a snake_case si es necesario
  especialistaSeleccionado.value = {
    id: e.id,
    nombre_completo: e.nombre_completo ?? e.nombreCompleto,
    especialidad: e.especialidad,
    registro_profesional: e.registro_profesional ?? e.registroProfesional,
    dias_horarios: e.dias_horarios ?? e.diasHorarios,
  }
  modoEdicion.value = true
  mostrarFormulario.value = true
}

function cancelarFormulario(): void {
  mostrarFormulario.value = false
}

async function guardarEspecialista(data: Especialista): Promise<void> {
  try {
    if (modoEdicion.value && data.id) {
      await ActualizarEspecialista(data.id, data)
    } else {
      await enviarEspecialista(data)
    }
    mostrarFormulario.value = false
    await cargarDatos()
    errorMsg.value = ''
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.error || 'Error al guardar'
  }
}

async function eliminarEspecialistaClick(id: number): Promise<void> {
  try {
    await EliminarEspecialista(id)
    await cargarDatos()
    errorMsg.value = ''
  } catch (e) {
    errorMsg.value = 'Error al eliminar'
  }
}

async function restaurarEspecialistaClick(id: number): Promise<void> {
  try {
    await RestaurarEspecialista(id)
    await cargarDatos()
    errorMsg.value = ''
  } catch (e) {
    errorMsg.value = 'Error al restaurar'
  }
}

async function eliminarDefinitivoClick(id: number): Promise<void> {
  try {
    await EliminarEspecialistaDefinitivo(id)
    await cargarDatos()
    errorMsg.value = ''
  } catch (e) {
    errorMsg.value = 'Error al eliminar definitivamente'
  }
}
</script>

<style scoped>
div.p-4.max-w-screen-lg.mx-auto {
  padding: 1rem;
  max-width: 1024px;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #222;
}

button {
  cursor: pointer;
  border-radius: 0.3rem;
  font-weight: 600;
  border: none;
  transition: background-color 0.3s ease;
}

button.bg-green-600 {
  background-color: #2f855a;
  color: white;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
}

button.bg-green-600:hover {
  background-color: #276749;
}

.flex.items-center.gap-2.mb-2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

label {
  font-weight: 500;
  color: #333;
}

select {
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
  background-color: white;
}

button.ml-2.px-3.py-1.bg-blue-500 {
  background-color: #4299e1;
  color: white;
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
}

button.ml-2.px-3.py-1.bg-blue-500:hover {
  background-color: #2b6cb0;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  color: #222;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
}

thead tr {
  background-color: #e2e8f0;
}

th, td {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
  font-size: 0.95rem;
  color: #333;
}

tbody tr.border-t {
  border-top: 1px solid #ccc;
}

td.space-x-2 > button {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

button.text-blue-600 {
  color: #3182ce;
}

button.text-blue-600:hover {
  background-color: #bee3f8;
}

button.text-red-600 {
  color: #e53e3e;
}

button.text-red-600:hover {
  background-color: #feb2b2;
}

button.text-green-600 {
  color: #38a169;
}

button.text-green-600:hover {
  background-color: #c6f6d5;
}

td div strong {
  font-weight: 600;
  color: #2d3748;
}

td div span {
  font-size: 0.9rem;
  color: #4a5568;
}

div.mt-4.text-red-600 {
  margin-top: 1rem;
  color: #e53e3e;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
}
</style>
