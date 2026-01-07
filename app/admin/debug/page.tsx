'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, Globe, Settings } from 'lucide-react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  // Debug bilgilerini al
  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/info');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug info error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // API testleri
  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    // Test 1: Database bağlantısı
    try {
      const dbResponse = await fetch('/api/debug/database');
      results.database = await dbResponse.json();
    } catch (error) {
      results.database = { success: false, error: error.message };
    }

    // Test 2: Menü API
    try {
      const menuResponse = await fetch('/api/menus');
      results.menus = await menuResponse.json();
    } catch (error) {
      results.menus = { success: false, error: error.message };
    }

    // Test 3: Sayfa API
    try {
      const pageResponse = await fetch('/api/pages');
      results.pages = await pageResponse.json();
    } catch (error) {
      results.pages = { success: false, error: error.message };
    }

    // Test 4: Blog API
    try {
      const blogResponse = await fetch('/api/blog');
      results.blog = await blogResponse.json();
    } catch (error) {
      results.blog = { success: false, error: error.message };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500">Çalışıyor</Badge>
    ) : (
      <Badge variant="destructive">Hata</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug & Teşhis</h1>
          <p className="text-muted-foreground">
            Sistem durumunu kontrol edin ve sorunları tespit edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDebugInfo} disabled={isLoading}>
            Debug Bilgilerini Yenile
          </Button>
          <Button onClick={runTests} disabled={isLoading}>
            API Testlerini Çalıştır
          </Button>
        </div>
      </div>

      {/* Environment Info */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Platform</h4>
                <div className="space-y-1 text-sm">
                  <div>Platform: {debugInfo.platform}</div>
                  <div>Node.js: {debugInfo.nodeVersion}</div>
                  <div>Next.js: {debugInfo.nextVersion}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Environment</h4>
                <div className="space-y-1 text-sm">
                  <div>NODE_ENV: {debugInfo.nodeEnv}</div>
                  <div>Database Host: {debugInfo.dbHost ? '✅ Set' : '❌ Missing'}</div>
                  <div>Database Name: {debugInfo.dbName ? '✅ Set' : '❌ Missing'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API Test Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.success)}
                  <div>
                    <div className="font-medium capitalize">{key}</div>
                    {result.error && (
                      <div className="text-sm text-red-500">{result.error}</div>
                    )}
                    {result.success && result.data && (
                      <div className="text-sm text-green-600">
                        {Array.isArray(result.data) ? `${result.data.length} kayıt` : 'Başarılı'}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.success)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Yaygın Sorunlar ve Çözümler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Database Bağlantı Hatası:</strong> Environment variables'ları kontrol edin. 
              Netlify'da DB_HOST, DB_USER, DB_PASSWORD, DB_NAME değerlerini ayarlayın.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>API 500 Hatası:</strong> Database bağlantısı yoksa mock data kullanılır. 
              Bu normal bir durumdur ve site çalışmaya devam eder.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sayfa Düzenleme Çalışmıyor:</strong> Admin panelinde giriş yapmış olmanız gerekiyor. 
              Login sayfasından admin123 şifresi ile giriş yapın.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/admin/login', '_blank')}>
            Admin Login Sayfası
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/api/menus', '_blank')}>
            Menü API'sini Test Et
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/api/pages', '_blank')}>
            Sayfa API'sini Test Et
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
