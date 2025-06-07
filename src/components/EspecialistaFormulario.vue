<template>
  <div class="bg-white p-4 rounded shadow mb-4">
    <h2 class="text-lg font-semibold mb-2">
      {{ modoEdicion ? 'Editar' : 'Nuevo' }} Especialista
    </h2>
    <form @submit.prevent="enviar">
      <!-- Nombre -->
      <div class="mb-2">
        <label class="block font-medium">Nombre completo *</label>
        <input v-model="form.nombre_completo" type="text" class="border rounded px-2 py-1 w-full" />
        <span v-if="errores.nombre_completo" class="text-red-600 text-sm">{{ errores.nombre_completo }}</span>
      </div>

      <!-- Especialidad -->
      <div class="mb-2">
        <label class="block font-medium">Especialidad *</label>
        <input v-model="form.especialidad" type="text" class="border rounded px-2 py-1 w-full" />
        <span v-if="errores.especialidad" class="text-red-600 text-sm">{{ errores.especialidad }}</span>
      </div>

      <!-- Registro profesional -->
      <div class="mb-2">
        <label class="block font-medium">Registro profesional *</label>
        <input v-model="form.registro_profesional" type="text" class="border rounded px-2 py-1 w-full" />
        <span v-if="errores.registro_profesional" class="text-red-600 text-sm">{{ errores.registro_profesional }}</span>
      </div>

      <!-- Días y horarios -->
      <div class="mb-2">
        <label class="block font-medium">Días y horarios de atención *</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <label v-for="dia in diasSemana" :key="dia" class="flex items-center gap-1">
            <input type="checkbox" :value="dia" v-model="diasSeleccionados" />
            {{ dia }}
          </label>
        </div>

        <div v-for="dia in diasSeleccionados" :key="dia" class="mb-2 border rounded p-2 bg-gray-50">
          <div class="font-semibold mb-1">{{ dia }}</div>
          <div v-for="(rango, idx) in form.dias_horarios[dia]" :key="idx" class="flex items-center gap-2 mb-1">
            <input type="time" v-model="rango.inicio" class="border rounded px-1" />
            <span>a</span>
            <input type="time" v-model="rango.fin" class="border rounded px-1" />
            <button type="button" class="text-red-600" @click="eliminarRango(dia, idx)">Quitar</button>
          </div>
          <button type="button" class="text-blue-600 text-sm" @click="agregarRango(dia)">Agregar rango</button>
          <span v-if="errores[`dias_horarios_${dia}`]" class="text-red-600 text-sm block">
            {{ errores[`dias_horarios_${dia}`] }}
          </span>
        </div>

        <span v-if="errores.dias_horarios" class="text-red-600 text-sm">{{ errores.dias_horarios }}</span>
      </div>

      <!-- Botones -->
      <div class="flex gap-2 mt-4">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
          {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
        </button>
        <button type="button" class="bg-gray-300 px-4 py-2 rounded" @click="$emit('cancelar')">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, toRaw } from 'vue'

interface Horario {
  inicio: string
  fin: string
}

interface Especialista {
  id: number | null
  nombre_completo: string
  especialidad: string
  registro_profesional: string
  dias_horarios: Record<string, Horario[]>
}

const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
]

const props = defineProps<{
  modoEdicion: boolean
  datosIniciales: Especialista | null
}>()

const emit = defineEmits<{
  (e: 'guardar', datos: Especialista): void
  (e: 'cancelar'): void
}>()

const form = reactive<Especialista>({
  id: null,
  nombre_completo: '',
  especialidad: '',
  registro_profesional: '',
  dias_horarios: {}
})

const errores = reactive<Record<string, string>>({})
const diasSeleccionados = ref<string[]>([])

watch(
  () => props.datosIniciales,
  (val) => {
    if (val) {
      Object.assign(form, val)
      diasSeleccionados.value = Object.keys(val.dias_horarios || {})
      diasSeleccionados.value.forEach(dia => {
        if (!form.dias_horarios[dia]) form.dias_horarios[dia] = []
      })
    } else {
      form.id = null
      form.nombre_completo = ''
      form.especialidad = ''
      form.registro_profesional = ''
      form.dias_horarios = {}
      diasSeleccionados.value = []
    }
  },
  { immediate: true }
)

watch(diasSeleccionados, (nuevos) => {
  nuevos.forEach(dia => {
    if (!form.dias_horarios[dia]) {
      form.dias_horarios[dia] = [{ inicio: '', fin: '' }]
    }
  })
  Object.keys(form.dias_horarios).forEach(dia => {
    if (!nuevos.includes(dia)) {
      delete form.dias_horarios[dia]
    }
  })
})

function agregarRango(dia: string) {
  form.dias_horarios[dia].push({ inicio: '', fin: '' })
}

function eliminarRango(dia: string, idx: number) {
  form.dias_horarios[dia].splice(idx, 1)
  if (form.dias_horarios[dia].length === 0) {
    delete form.dias_horarios[dia]
    diasSeleccionados.value = diasSeleccionados.value.filter(d => d !== dia)
  }
}

function hayTraslapes(rangos: Horario[]): boolean {
  const ordenados = rangos
    .filter(r => r.inicio && r.fin)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))

  for (let i = 1; i < ordenados.length; i++) {
    if (ordenados[i].inicio < ordenados[i - 1].fin) {
      return true
    }
  }
  return false
}

function validar(): boolean {
  Object.keys(errores).forEach(k => delete errores[k])
  let valido = true

  if (!form.nombre_completo || form.nombre_completo.length < 3) {
    errores.nombre_completo = 'Debe tener al menos 3 caracteres'
    valido = false
  }

  if (!form.especialidad) {
    errores.especialidad = 'La especialidad es obligatoria'
    valido = false
  }

  if (!form.registro_profesional) {
    errores.registro_profesional = 'El registro profesional es obligatorio'
    valido = false
  }

  if (!diasSeleccionados.value.length) {
    errores.dias_horarios = 'Selecciona al menos un día y un rango'
    valido = false
  }

  diasSeleccionados.value.forEach(dia => {
    const rangos = form.dias_horarios[dia] || []

    if (!rangos.length || rangos.some(r => !r.inicio || !r.fin)) {
      errores[`dias_horarios_${dia}`] = 'Completa todos los rangos de este día'
      valido = false
    } else if (
      rangos.some(r => new Date(`1970-01-01T${r.inicio}`) >= new Date(`1970-01-01T${r.fin}`))
    ) {
      errores[`dias_horarios_${dia}`] = 'Cada rango debe tener un inicio anterior al fin'
      valido = false
    } else if (hayTraslapes(rangos)) {
      errores[`dias_horarios_${dia}`] = 'Hay traslapes en los horarios de este día'
      valido = false
    }
  })

  return valido
}

function enviar() {
  if (!validar()) return
  emit('guardar', toRaw(form))
}
</script>
<style scoped>
/* Contenedor del formulario */
div.bg-white {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  margin-bottom: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Título */
h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

/* Labels */
label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #444;
}

/* Inputs de texto y time */
input[type="text"],
input[type="time"] {
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="time"]:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 4px rgba(0,123,255,0.5);
}

/* Checkbox */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 0.25rem;
  vertical-align: middle;
  cursor: pointer;
}

/* Contenedor de checkboxes */
.flex.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Etiquetas de checkbox */
.flex.items-center.gap-1 label,
.flex.items-center.gap-2 {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

/* Contenedor días y horarios */
div.mb-2.border.rounded.p-2.bg-gray-50 {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

/* Nombre día */
div.font-semibold.mb-1 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #222;
}

/* Línea de rango horario */
.flex.items-center.gap-2.mb-1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

/* Botones pequeños */
button.text-red-600,
button.text-blue-600 {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}

button.text-red-600 {
  color: #d9534f;
}

button.text-red-600:hover {
  text-decoration: underline;
}

button.text-blue-600 {
  color: #0275d8;
}

button.text-blue-600:hover {
  text-decoration: underline;
}

/* Mensajes de error */
.text-red-600.text-sm {
  color: #d9534f;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

/* Botones principales */
.flex.gap-2.mt-4 {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Botón submit */
button[type="submit"] {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 0.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

/* Botón cancelar */
button[type="button"] {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 0.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="button"]:hover {
  background-color: #c7c7c7;
}
</style>
