import sanitizeHtml from 'sanitize-html';
import logger from './logger';

/**
 * Configuração de sanitização HTML para templates
 * Permite tags seguras e remove scripts, iframes, etc
 */
const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'p', 'span', 'a', 'br', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'ul', 'ol', 'li',
    'strong', 'b', 'em', 'i', 'u', 'small', 'sub', 'sup',
    'img', 'pre', 'code', 'blockquote',
    'form', 'input', 'label', 'button', 'textarea', 'select', 'option',
    'style' // Permitir style para templates
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style'],
    table: ['border', 'cellpadding', 'cellspacing', 'style'],
    div: ['style', 'class', 'id', 'data-*'],
    span: ['style', 'class', 'id'],
    p: ['style', 'class', 'align'],
    h1: ['style', 'class'],
    h2: ['style', 'class'],
    h3: ['style', 'class'],
    h4: ['style', 'class'],
    h5: ['style', 'class'],
    h6: ['style', 'class'],
    td: ['style', 'align', 'valign', 'colspan', 'rowspan'],
    th: ['style', 'align', 'valign', 'colspan', 'rowspan'],
    form: ['method', 'action'],
    input: ['type', 'name', 'value', 'placeholder', 'required', 'disabled'],
    button: ['type', 'name', 'value'],
    textarea: ['name', 'rows', 'cols', 'placeholder'],
    select: ['name', 'required', 'disabled'],
    option: ['value', 'selected'],
    ul: ['style'],
    ol: ['style'],
    li: ['style'],
    code: ['style', 'class'],
    pre: ['style', 'class'],
    blockquote: ['style', 'class'],
  },
  allowedStyles: {
    '*': {
      // Estilos CSS permitidos
      'color': [/.*/],
      'background-color': [/.*/],
      'font-size': [/.*/],
      'font-weight': [/.*/],
      'text-align': [/.*/],
      'border': [/.*/],
      'padding': [/.*/],
      'margin': [/.*/],
      'width': [/.*/],
      'height': [/.*/],
      'display': [/.*/],
      'float': [/.*/],
      'clear': [/.*/],
      'text-decoration': [/.*/],
      'line-height': [/.*/],
    },
  },
  nonTextTags: ['style', 'script', 'textarea', 'option'],
  disallowedTagsMode: 'discard',
};

export class SanitizeService {
  /**
   * Sanitiza HTML removendo conteúdo malicioso
   * @param html HTML a ser sanitizado
   * @returns HTML sanitizado
   */
  static sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    try {
      return sanitizeHtml(html, SANITIZE_OPTIONS as any);
    } catch (error) {
      logger.warn('Erro ao sanitizar HTML:', error);
      return '';
    }
  }

  /**
   * Valida se o conteúdo HTML é seguro
   * @param html HTML a ser validado
   * @returns true se o HTML é seguro
   */
  static isHTMLSafe(html: string): boolean {
    if (!html || typeof html !== 'string') {
      return true;
    }

    const sanitized = this.sanitizeHTML(html);
    // Se o HTML sanitizado for significativamente menor, pode haver conteúdo malicioso
    // Mas permitimos mudanças menores por causa da formatação
    const sizeDiff = Math.abs(html.length - sanitized.length);
    const sizeRatio = sizeDiff / Math.max(html.length, 1);

    // Se mais de 30% do HTML foi removido, é suspeito
    if (sizeRatio > 0.3) {
      logger.warn(`HTML suspeito detectado: ${sizeRatio * 100}% removido após sanitização`);
      return false;
    }

    return true;
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

    // Sanitizar com a biblioteca
    return this.sanitizeHTML(sanitized);
  }

  /**
   * Extrai variáveis Handlebars do template
   * @param template conteúdo do template
   * @returns array de variáveis encontradas
   */
  static extractTemplateVariables(template: string): string[] {
    if (!template || typeof template !== 'string') {
      return [];
    }

    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.push(match[1].trim());
    }

    return [...new Set(variables)]; // Remove duplicatas
  }

  /**
   * Valida se as variáveis do template são conhecidas/seguras
   * @param template conteúdo do template
   * @param allowedVariables lista de variáveis permitidas
   * @returns true se apenas variáveis permitidas são usadas
   */
  static validateTemplateVariables(template: string, allowedVariables: string[]): boolean {
    const templateVars = this.extractTemplateVariables(template);
    const allowed = new Set(allowedVariables);

    for (const variable of templateVars) {
      const baseName = variable.split(/[.\[\]]/).filter(v => v)[0];
      if (!allowed.has(baseName)) {
        logger.warn(`Variável não permitida detectada no template: ${baseName}`);
        return false;
      }
    }

    return true;
  }
}
