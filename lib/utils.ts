import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Page content'i string'e çeviren utility fonksiyonu
export function parsePageContent(content: any): string {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    // JSON array ise, text içeriklerini birleştir
    return content
      .map(section => {
        if (typeof section === 'object' && section.content) {
          return section.content;
        }
        return '';
      })
      .join(' ');
  }
  
  return '';
}

// HTML tag'lerini temizleyen ve kısaltan fonksiyon
export function cleanAndTruncateContent(content: any, maxLength: number = 120): string {
  const text = parsePageContent(content);
  return text.replace(/<[^>]*>/g, '').substring(0, maxLength) + '...';
}
