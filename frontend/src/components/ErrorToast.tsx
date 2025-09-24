import { getErrorMessage } from "@/lib/errorUtils";
import toast from 'react-hot-toast';

/**
 * Exibe uma mensagem de erro amigável para o usuário usando toast
 * mantendo o design original, mas garantindo que a mensagem de erro seja exibida corretamente
 */
export const showErrorToast = (contextMsg: string, error: any) => {
  const errorMessage = getErrorMessage(error);
  
  // Formato simples como antes, mas com a mensagem de erro correta
  toast.error(`${contextMsg}: ${errorMessage}`, {
    duration: 4000, // Duração ajustada para 4 segundos
  });
};