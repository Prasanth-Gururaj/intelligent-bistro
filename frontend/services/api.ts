import axios from 'axios';
const api = axios.create({ baseURL: 'http://10.0.2.2:3001', timeout: 10000 });
export const sendChatMessage = async (message: string, cart: any, history: any) => {
  try {
    const response = await api.post('/api/chat', { message, cart, history });
    return response.data;
  } catch {
    throw new Error('NETWORK_ERROR');
  }
};
