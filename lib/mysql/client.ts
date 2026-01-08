// Vercel-compatible database client
// Uses environment variable to determine database type

// Mock pool for Vercel (no database yet)
const pool = {
  execute: async (sql: string, params: any[] = []) => {
    console.warn('⚠️ Database not configured. Using mock data.');

    // Return empty results for now
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return [[]]; // Empty array for SELECT queries
    }

    // Return success for INSERT/UPDATE/DELETE
    return [{ affectedRows: 0, insertId: 0 }];
  }
};

export { pool };
export default pool;
