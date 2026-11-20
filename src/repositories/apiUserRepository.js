import { createApiClient } from './apiClient.js';

export function createApiUserRepository(request = createApiClient()) {
  return {
    async list() {
      const response = await request('/user/getall');
      if (!Array.isArray(response.data)) throw new Error('A API devolveu uma lista de cadastros inválida.');
      return response.data;
    },
    async get(id) {
      return (await request(`/user/get/${id}`)).data;
    },
    async create(name, password) {
      if (!name.trim() || name.trim().length > 80) throw new Error('Informe um nome com até 80 caracteres.');
      if (password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      const response = await request('/user/create', {
        method: 'POST', body: JSON.stringify({ name, password, changePassword: false }),
      });
      if (!response.id) throw new Error('Cadastro criado. Atualize a lista para selecioná-lo.');
      return response.id;
    },
    async update(id, name, password, changePassword) {
      if (changePassword && password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      if (!changePassword && (!name.trim() || name.trim().length > 80)) throw new Error('Informe um nome com até 80 caracteres.');
      await request(`/user/update/${id}`, {
        method: 'PUT', body: JSON.stringify({ name, password, changePassword }),
      });
    },
    async remove(id) {
      await request(`/user/delete/${id}`, { method: 'DELETE' });
    },
    async subscribe(userId, lessonId) {
      await request(`/user/update/${userId}/lesson/${lessonId}`, { method: 'PUT' });
    },
  };
}
