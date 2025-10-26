const BASE_URL = "https://mindtrade-oficial.vercel.app/api"

export async function getItems(type: string) {
  try {
    const res = await fetch(`${BASE_URL}/${type}`)
    if (!res.ok) throw new Error(`Erro ao buscar ${type}`)
    return await res.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function addItem(type: string, item: any) {
  try {
    const res = await fetch(`${BASE_URL}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    if (!res.ok) throw new Error(`Erro ao adicionar ${type}`)
    const data = await res.json()
    return { success: true, data }
  } catch (err: any) {
    console.error(err)
    return { success: false, message: err.message }
  }
}

export async function updateItem(type: string, id: string | number, item: any) {
  try {
    const res = await fetch(`${BASE_URL}/${type}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    if (!res.ok) throw new Error(`Erro ao atualizar ${type}`)
    const data = await res.json()
    return { success: true, data }
  } catch (err: any) {
    console.error(err)
    return { success: false, message: err.message }
  }
}

export async function deleteItem(type: string, id: string | number) {
  try {
    const res = await fetch(`${BASE_URL}/${type}?id=${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error(`Erro ao deletar ${type}`)
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, message: err.message }
  }
}
// --- funções temporárias para manter o Dashboard funcionando ---
export function getTradings() {
  console.warn("getTradings() temporário — ainda não conectado ao NeonDB")
  return []
}
