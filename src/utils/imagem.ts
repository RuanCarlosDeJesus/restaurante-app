/**
 * Redimensiona e comprime a foto no navegador antes de salvar.
 * Uma foto de celular (3–5 MB) vira ~60–120 KB, o que mantém o site rápido
 * e cabe no armazenamento local enquanto não há backend.
 */
export async function comprimirImagem(arquivo: File, tamanhoMaximo = 900, qualidade = 0.8) {
  if (!arquivo.type.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem (JPG, PNG ou WEBP).')
  }

  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, tamanhoMaximo / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const webp = canvas.toDataURL('image/webp', qualidade)
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', qualidade)
}
