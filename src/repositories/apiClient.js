export function createApiClient(baseUrl = import.meta.env?.VITE_API_URL || '/api', fetcher = globalThis.fetch) {
  return async function request(path, options = {}) {
    let response;
    try {
      response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
        ...options,
        headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
        signal: options.signal ?? AbortSignal.timeout(60000),
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('Não foi possível conectar à API. Verifique sua conexão e tente novamente.');
    }

    const text = await response.text();
    let data = text;
    if (text && response.headers.get('content-type')?.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('A API devolveu uma resposta inválida.');
      }
    }
    if (!response.ok) {
      if ([502, 503, 504].includes(response.status)) {
        throw new Error('A API está indisponível no momento. Aguarde um pouco e tente novamente.');
      }
      const message = typeof data === 'string' ? data : data?.detail || data?.message || data?.error;
      throw new Error(message || `A API não conseguiu concluir a operação (${response.status}).`);
    }
    return { data, id: response.headers.get('X-Resource-Id') };
  };
}
