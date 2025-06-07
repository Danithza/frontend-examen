import axios from 'axios'
const API_URL =  'http://localhost:3333/especialistas'

export async function  enviarEspecialista(datos: any) {
  try {
    const response = await axios.post(API_URL, datos)
    return response.data
  } catch (error) {
    console.error('Error ao enviar especialista:', error)
    throw error
  }
}

export async function ObtenerEspecialistas() {
  try {
    const response = await axios.get(API_URL)
    return response.data
  } catch (error) {
    console.error('Error ao obter especialistas:', error)
    throw error
  }
}

export async function ObtenerEspecialistasporId(id: string) {
  try {
    const response = await axios.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error ao obter especialista por ID:', error)
    throw error
  }
}

export async function ActualizarEspecialista(id: string, especialista: any) {
  try {
    const response = await axios.put(`${API_URL}/${id}`, especialista)
    return response.data
  } catch (error) {
    console.error('Error ao atualizar especialista:', error)
    throw error
  }
}

export async function EliminarEspecialista(id: number) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar especialista:', error)
    throw error
  }
}

export async function RestaurarEspecialista(id: number) {
  try {
    const response = await axios.put(`${API_URL}/${id}/restaurar`)
    return response.data
  } catch (error) {
    console.error('Error al restaurar especialista:', error)
    throw error
  }
}

export async function EliminarEspecialistaDefinitivo(id: number) {
  try {
    const response = await axios.delete(`${API_URL}/${id}/definitivo`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar definitivamente:', error)
    throw error
  }
}

export async function ObtenerEspecialistasOrdenados(orderBy: string, direction: string) {
  try {
    const response = await axios.get(`${API_URL}?orderBy=${orderBy}&direction=${direction}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener especialistas ordenados:', error)
    throw error
  }
}

export async function ObtenerEspecialistasInactivos() {
  try {
    const response = await axios.get(`${API_URL}/inactivos`)
    return response.data
  } catch (error) {
    console.error('Error al obtener especialistas inactivos:', error)
    throw error
  }
}
