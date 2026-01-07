import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Cookie boyutunu optimize et - max 4KB
              if (value && value.length > 4000) {
                console.warn(`⚠️ Large cookie detected: ${name} (${value.length} bytes)`)
                // Büyük cookie'yi bölme veya storage'a taşıma işlemi yapılabilir
                return
              }
              cookieStore.set(name, value, {
                ...options,
                // Daha agresif cache ayarları
                maxAge: 60 * 60, // 1 saat (7 gün yerine)
                sameSite: 'lax',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
              })
            })
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        // Session'ı localStorage'da da sakla
        persistSession: true,
        detectSessionInUrl: false,
        // Auto-refresh'i devre dışı bırak
        autoRefreshToken: false,
      },
    }
  )
}

// Keep the old export for backward compatibility
export async function createClient() {
  return createServerClient()
}
