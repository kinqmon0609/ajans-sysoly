import { NextResponse } from 'next/server';
import dbPool from '@/lib/mysql/client';

export async function GET() {
  try {
    // Check if MySQL is configured
    const hasMySQL = !!(process.env.DB_HOST && process.env.DB_NAME);
    
    if (hasMySQL) {
      // Test MySQL connection
      try {
        const [rows] = await dbPool.execute('SELECT 1 as test');
        
        return NextResponse.json({
          success: true,
          message: 'MySQL bağlantısı başarılı',
          type: 'MySQL',
          connectionInfo: {
            host: process.env.DB_HOST || 'Missing',
            database: process.env.DB_NAME || 'Missing',
            port: process.env.DB_PORT || 'Missing'
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'MySQL bağlantısı başarısız',
          message: 'Mock data kullanılacak',
          type: 'MySQL',
          fallback: 'Uygulama mock data ile çalışmaya devam edecek',
          details: (error as Error).message
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'MySQL konfigürasyonu bulunamadı',
        message: 'Mock data kullanılacak',
        type: 'None',
        fallback: 'Uygulama mock data ile çalışmaya devam edecek'
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      message: 'Database bağlantısı başarısız - Mock data kullanılacak',
      fallback: 'Uygulama mock data ile çalışmaya devam edecek'
    });
  }
}
