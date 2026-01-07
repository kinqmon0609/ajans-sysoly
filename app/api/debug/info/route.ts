import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      platform: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Local',
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      nextVersion: process.env.npm_package_dependencies_next || 'Unknown',
      timestamp: new Date().toISOString(),
      
      // Environment variables (güvenli olanlar)
      dbHost: !!process.env.DB_HOST,
      dbName: !!process.env.DB_NAME,
      dbUser: !!process.env.DB_USER,
      dbPassword: !!process.env.DB_PASSWORD,
      
      // App URLs
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      
      // Features
      hasDatabase: !!(process.env.DB_HOST && process.env.DB_NAME),
      hasEmail: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      
      // Build info
      buildTime: process.env.BUILD_TIME || 'Unknown',
      gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || 'Unknown'
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug info alınamadı', details: (error as Error).message },
      { status: 500 }
    );
  }
}
