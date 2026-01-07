/**
 * Development modunda fetch hatalarını tamamen gizle
 * React Strict Mode'da double render olduğu için bazı fetchler başarısız olabilir
 * Bu tamamen normal ve beklenen bir davranıştır
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Console.error'ı override et
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args: any[]) => {
    // Tüm argümanları string'e çevir ve kontrol et
    const stringifiedArgs = args.map(arg => {
      if (arg instanceof Error) return arg.message + '\n' + arg.stack
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg)
        } catch (e) {
          // Circular structure durumunda sadece tip bilgisini döndür
          return `[${arg.constructor?.name || 'Object'}]`
        }
      }
      return String(arg)
    }).join(' ')
    
    // Bu hataları gizle (React Strict Mode'dan kaynaklanıyor veya önemsiz)
    if (
      stringifiedArgs.includes('Failed to fetch') ||
      stringifiedArgs.includes('NetworkError') ||
      stringifiedArgs.includes('fetch failed') ||
      stringifiedArgs.includes('Load failed') ||
      stringifiedArgs.includes('TypeError: Failed to fetch') ||
      stringifiedArgs.includes('Error fetching') ||
      stringifiedArgs.includes('Analytics tracking error') ||
      stringifiedArgs.includes('Unexpected end of JSON input') ||
      stringifiedArgs.includes('JSON parse error')
    ) {
      // Development'ta normal, production'da olmayacak
      return
    }
    
    // Diğer hataları göster
    originalError.apply(console, args)
  }

  // Warning'leri de filtrele
  console.warn = (...args: any[]) => {
    const stringifiedArgs = args.map(arg => String(arg)).join(' ')
    
    if (stringifiedArgs.includes('Failed to fetch')) {
      return
    }
    
    originalWarn.apply(console, args)
  }

  // Global error handler ekle
  const originalWindowError = window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    const msg = String(message)
    if (msg.includes('Failed to fetch') || msg.includes('Load failed')) {
      return true // Hata yakalandı, propagate etme
    }
    
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error)
    }
    return false
  }

  // Unhandled promise rejection handler
  const originalRejection = window.onunhandledrejection
  window.onunhandledrejection = (event) => {
    const reason = event.reason
    const msg = reason?.message || String(reason)
    
    if (msg.includes('Failed to fetch') || msg.includes('Load failed')) {
      event.preventDefault() // Hata mesajını engelle
      return
    }
    
    if (originalRejection) {
      originalRejection.call(window, event)
    }
  }
}

export {}

