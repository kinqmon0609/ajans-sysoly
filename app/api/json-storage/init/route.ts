import { NextRequest, NextResponse } from 'next/server';
import { initializeJsonDatabase, resetJsonDatabase } from '@/lib/json-storage/init-data';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'reset') {
      console.log('🔄 JSON veritabanı sıfırlanıyor...');
      const result = await resetJsonDatabase();
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'JSON veritabanı başarıyla sıfırlandı ve yeniden başlatıldı!'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'JSON veritabanı sıfırlama işlemi başarısız!'
        }, { status: 500 });
      }
    } else {
      console.log('🚀 JSON veritabanı başlatılıyor...');
      const result = await initializeJsonDatabase();
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'JSON veritabanı başarıyla başlatıldı!'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'JSON veritabanı başlatma işlemi başarısız!'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('JSON Storage init error:', error);
    return NextResponse.json({
      success: false,
      message: 'JSON Storage başlatma hatası: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await initializeJsonDatabase();
    
    return NextResponse.json({
      success: result,
      message: result ? 'JSON veritabanı hazır!' : 'JSON veritabanı başlatılamadı!'
    });
  } catch (error) {
    console.error('JSON Storage init error:', error);
    return NextResponse.json({
      success: false,
      message: 'JSON Storage başlatma hatası: ' + (error as Error).message
    }, { status: 500 });
  }
}
