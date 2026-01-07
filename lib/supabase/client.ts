import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_DATABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    // Test with a simple query to check if tables exist
    const { data, error } = await supabase.from('menus').select('*').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('✅ Supabase connection successful - tables exist')
    return true
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}

// Database operations wrapper
export async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log('Supabase query:', query.substring(0, 50) + '...')
    
    // Try to execute query with Supabase directly
    const result = await executeSupabaseQuery(query, params)
    if (result) {
      return result
    }
    
    // Fallback to mock data
    console.log('Supabase query failed, using mock data')
    return getMockData(query)
    
  } catch (error) {
    console.error('Database error:', error)
    // Return mock data as fallback
    return getMockData(query)
  }
}

// Execute query with Supabase
async function executeSupabaseQuery(query: string, params: any[] = []) {
  try {
    const queryLower = query.toLowerCase().trim()
    
    // Handle SELECT queries
    if (queryLower.startsWith('select')) {
      const tableName = extractTableName(query)
      if (tableName) {
        const { data, error } = await supabase.from(tableName).select('*')
        if (error) {
          console.error(`Supabase query error for table ${tableName}:`, error)
          return null
        }
        console.log(`✅ Supabase SELECT from ${tableName}: ${data?.length || 0} rows`)
        return [data || []]
      }
    }
    
    // Handle INSERT queries
    if (queryLower.startsWith('insert')) {
      const tableName = extractTableName(query)
      if (tableName) {
        // Extract values from INSERT query
        const insertData = extractInsertData(query, params)
        const { data, error } = await supabase.from(tableName).insert(insertData)
        if (error) {
          console.error(`Supabase insert error for table ${tableName}:`, error)
          return null
        }
        return [{ insertId: data?.[0]?.id, affectedRows: 1 }]
      }
    }
    
    // Handle UPDATE queries
    if (queryLower.startsWith('update')) {
      const tableName = extractTableName(query)
      if (tableName) {
        const { data, error } = await supabase.from(tableName).update(params[0] || {}).eq('id', params[1])
        if (error) {
          console.error(`Supabase update error for table ${tableName}:`, error)
          return null
        }
        return [{ affectedRows: 1 }]
      }
    }
    
    return null
  } catch (error) {
    console.error('Supabase query execution error:', error)
    return null
  }
}

// Extract table name from SQL query
function extractTableName(query: string): string | null {
  const match = query.match(/(?:from|into|update)\s+(\w+)/i)
  return match ? match[1] : null
}

// Extract insert data from SQL query
function extractInsertData(query: string, params: any[]): any {
  // Parse INSERT query to extract column names and values
  const match = query.match(/INSERT INTO\s+\w+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
  if (!match) return {}
  
  const columns = match[1].split(',').map(col => col.trim())
  const values = match[2].split(',').map(val => val.trim())
  
  const data: any = {}
  columns.forEach((col, index) => {
    if (values[index] === '?') {
      data[col] = params[index]
    } else if (values[index] === 'NOW()') {
      data[col] = new Date().toISOString()
    } else if (values[index] === 'true' || values[index] === 'false') {
      data[col] = values[index] === 'true'
    } else if (values[index] === 'null') {
      data[col] = null
    } else {
      data[col] = values[index].replace(/['"]/g, '')
    }
  })
  
  return data
}

// Mock data fallback
function getMockData(query: string) {
  if (query.toLowerCase().includes('menus')) {
    return [
      { id: '1', name: 'Hakkımızda', url: '/hakkimizda', parent_id: null, sort_order: 0, is_active: 1 },
      { id: '2', name: 'Hizmetlerimiz', url: '/hizmetlerimiz', parent_id: null, sort_order: 1, is_active: 1 },
      { id: '3', name: 'İletişim', url: '/iletisim', parent_id: null, sort_order: 2, is_active: 1 }
    ]
  }
  
  if (query.toLowerCase().includes('pages')) {
    return [
      {
        id: '1',
        title: 'Hakkımızda',
        slug: 'hakkimizda',
        content: JSON.stringify([
          { type: 'heading', content: 'Hakkımızda', level: 1 },
          { type: 'paragraph', content: 'Modern web teknolojileri ile hizmet veriyoruz.' }
        ]),
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
  
  if (query.toLowerCase().includes('blog')) {
    return [
      {
        id: '1',
        title: 'Modern Web Tasarım Trendleri',
        slug: 'modern-web-tasarim-trendleri',
        content: 'Web tasarımında yeni trendler...',
        excerpt: '2024 yılında web tasarımında öne çıkan trendler',
        is_active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
  
  return []
}