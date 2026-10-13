/** Baixa um texto como arquivo (cria um link temporário e clica nele). */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Libera a memória depois que o navegador começou o download
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Lê um arquivo escolhido pelo usuário como texto. */
export function readFileAsText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo'));
    reader.readAsText(file);
  });
}
