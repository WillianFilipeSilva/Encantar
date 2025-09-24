/**
 * Utilitário para extrair mensagens de erro da API de forma consistente
 */

export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error && typeof error.response.data.error === 'string') {
    return error.response.data.error;
  }
  
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
    return error.response.data.errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join('. ');
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message && error.message !== 'Error') {
    return error.message;
  }
  
  if (error.response?.status) {
    const statusMessages: Record<number, string> = {
      400: 'Requisição inválida',
      401: 'Não autorizado',
      403: 'Acesso negado',
      404: 'Não encontrado',
      409: 'Conflito',
      422: 'Dados inválidos',
      500: 'Erro interno do servidor',
    };
    
    return statusMessages[error.response.status] || `Erro ${error.response.status}`;
  }
  
  return 'Erro ao processar a solicitação';
};

export const logError = (context: string, error: any): void => {
  console.group(`📌 [${context}] Erro Detalhado`);
  
  console.error('Erro original:', error);
  
  if (error.response?.data) {
    console.error('Resposta do servidor:', error.response.data);
    
    const mensagem = error.response.data.error || 
                     error.response.data.message || 
                     error.message || 
                     'Erro desconhecido';
                     
    console.error('Mensagem de erro:', mensagem);
    
    if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
      console.error('Erros de validação:', error.response.data.errors);
      
      error.response.data.errors.forEach((validationError: any, index: number) => {
        console.error(`Erro de validação #${index + 1}:`, {
          campo: validationError.path,
          valor: validationError.value,
          mensagem: validationError.msg,
          localização: validationError.location
        });
      });
    }
    
    if (error.response.data.stack) {
      console.error('Stack trace do servidor:', error.response.data.stack);
    }
    
    if (error.response.data.details) {
      console.error('Detalhes adicionais:', error.response.data.details);
    }
  }
  
  if (error.config) {
    console.error('Detalhes da requisição:', {
      url: error.config.url,
      method: error.config.method?.toUpperCase(),
      headers: error.config.headers,
      data: error.config.data ? JSON.parse(error.config.data) : undefined
    });
  }
  
  if (error.response?.status) {
    console.error('Status da resposta:', `${error.response.status} (${error.response.statusText})`);
  }
  
  console.groupEnd();
};