import DOMPurify from 'dompurify';

/**
 * Utilitário para sanitizar HTML no frontend
 * Usa DOMPurify para remover scripts e conteúdo malicioso
 */
export class SanitizeUtil {
  /**
   * Configuração padrão de sanitização
   */
  private static readonly SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'div', 'p', 'span', 'a', 'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'ul', 'ol', 'li',
      'strong', 'b', 'em', 'i', 'u', 'small', 'sub', 'sup',
      'img', 'pre', 'code', 'blockquote',
      'form', 'input', 'label', 'button', 'textarea', 'select', 'option',
      'style'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel',
      'width', 'height', 'border', 'cellpadding', 'cellspacing',
      'style', 'class', 'id',
      'type', 'name', 'value', 'placeholder', 'required', 'disabled',
      'method', 'action',
      'rows', 'cols',
      'align', 'valign', 'colspan', 'rowspan'
    ],
    KEEP_CONTENT: true,
  };

  /**
   * Sanitiza HTML removendo scripts e conteúdo malicioso
   * @param html HTML a ser sanitizado
   * @returns HTML sanitizado
   */
  static sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    try {
      return DOMPurify.sanitize(html, this.SANITIZE_CONFIG);
    } catch (error) {
      console.warn('Erro ao sanitizar HTML:', error);
      return '';
    }
  }

  /**
   * Remove scripts e tags perigosas do template
   * @param template conteúdo do template
   * @returns template seguro
   */
  static sanitizeTemplate(template: string): string {
    if (!template || typeof template !== 'string') {
      return '';
    }

    // Remover tags de script completamente
    let sanitized = template.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remover eventos on* (onclick, onerror, etc)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remover iframes
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remover eval
    sanitized = sanitized.replace(/eval\s*\(/gi, '');

    // Remover javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Sanitizar com DOMPurify
    return this.sanitizeHTML(sanitized);
  }

  /**
   * Valida se o HTML contém conteúdo potencialmente malicioso
   * @param html HTML a ser validado
   * @returns true se o HTML parece seguro
   */
  static isHTMLSafe(html: string): boolean {
    if (!html || typeof html !== 'string') {
      return true;
    }

    // Verificar se contém patterns perigosos
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i,
      /<object/i,
      /<embed/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        console.warn('HTML perigoso detectado:', pattern);
        return false;
      }
    }

    return true;
  }
}
