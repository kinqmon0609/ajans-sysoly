'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Users,
  Package,
  Globe,
  Settings
} from 'lucide-react';

interface TableInfo {
  name: string;
  count: number;
  lastModified: string;
  icon: React.ReactNode;
}

export default function JsonStoragePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [storageStatus, setStorageStatus] = useState<'mysql' | 'json' | 'unknown'>('unknown');

  const tableIcons = {
    menus: <Globe className="h-4 w-4" />,
    pages: <FileText className="h-4 w-4" />,
    blog: <FileText className="h-4 w-4" />,
    categories: <Package className="h-4 w-4" />,
    demos: <Package className="h-4 w-4" />,
    packages: <Package className="h-4 w-4" />,
    notifications: <AlertCircle className="h-4 w-4" />,
    contacts: <Users className="h-4 w-4" />,
    quote_requests: <Users className="h-4 w-4" />,
    newsletter: <Users className="h-4 w-4" />,
    users: <Users className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />
  };

  const tableNames = {
    menus: 'Menüler',
    pages: 'Sayfalar',
    blog: 'Blog Yazıları',
    categories: 'Kategoriler',
    demos: 'Demo Projeler',
    packages: 'Paketler',
    notifications: 'Bildirimler',
    contacts: 'İletişim',
    quote_requests: 'Teklif Talepleri',
    newsletter: 'Newsletter',
    users: 'Kullanıcılar',
    settings: 'Ayarlar'
  };

  useEffect(() => {
    checkStorageStatus();
    loadTableInfo();
  }, []);

  const checkStorageStatus = async () => {
    try {
      // Environment variable'dan storage tipini kontrol et
      const isJsonStorage = process.env.NODE_ENV === 'production' || 
                           (typeof window !== 'undefined' && localStorage.getItem('useJsonStorage') === 'true');
      setStorageStatus(isJsonStorage ? 'json' : 'mysql');
    } catch (error) {
      setStorageStatus('unknown');
    }
  };

  const loadTableInfo = async () => {
    setLoading(true);
    try {
      // Her tablo için bilgi al
      const tableList = Object.keys(tableNames);
      const tableInfos: TableInfo[] = [];

      for (const tableName of tableList) {
        try {
          const response = await fetch(`/api/${tableName}`);
          if (response.ok) {
            const data = await response.json();
            const count = Array.isArray(data) ? data.length : 0;
            tableInfos.push({
              name: tableName,
              count,
              lastModified: new Date().toISOString(),
              icon: tableIcons[tableName as keyof typeof tableIcons] || <Database className="h-4 w-4" />
            });
          }
        } catch (error) {
          console.error(`Error loading ${tableName}:`, error);
        }
      }

      setTables(tableInfos);
    } catch (error) {
      console.error('Error loading table info:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeJsonStorage = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/json-storage/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'init' })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setStorageStatus('json');
        loadTableInfo();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'JSON Storage başlatma hatası: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const resetJsonStorage = async () => {
    if (!confirm('JSON Storage\'ı sıfırlamak istediğinizden emin misiniz? Tüm veriler silinecek!')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/json-storage/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadTableInfo();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'JSON Storage sıfırlama hatası: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup/export', {
        method: 'POST'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ajans1-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage({ type: 'success', text: 'Veri yedekleme başarılı!' });
      } else {
        setMessage({ type: 'error', text: 'Veri yedekleme hatası!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Veri yedekleme hatası: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const getStorageStatusBadge = () => {
    switch (storageStatus) {
      case 'json':
        return <Badge variant="default" className="bg-green-500">JSON Storage</Badge>;
      case 'mysql':
        return <Badge variant="secondary">MySQL</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JSON Storage Yönetimi</h1>
          <p className="text-muted-foreground">
            Netlify deployment için JSON tabanlı veri saklama sistemi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mevcut Sistem:</span>
          {getStorageStatusBadge()}
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="tables">Tablolar</TabsTrigger>
          <TabsTrigger value="actions">İşlemler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Tablo</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tables.length}</div>
                <p className="text-xs text-muted-foreground">
                  JSON dosyalarında saklanan tablo sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tables.reduce((sum, table) => sum + table.count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tüm tablolardaki toplam kayıt sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
                {storageStatus === 'json' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : storageStatus === 'mysql' ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {storageStatus === 'json' ? 'Hazır' : storageStatus === 'mysql' ? 'MySQL' : 'Bilinmiyor'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {storageStatus === 'json' 
                    ? 'JSON Storage aktif' 
                    : storageStatus === 'mysql' 
                    ? 'MySQL kullanılıyor' 
                    : 'Sistem durumu belirsiz'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <Card key={table.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {table.icon}
                    {tableNames[table.name as keyof typeof tableNames] || table.name}
                  </CardTitle>
                  <Badge variant="outline">{table.count}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{table.count}</div>
                  <p className="text-xs text-muted-foreground">
                    Kayıt sayısı
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  JSON Storage Başlat
                </CardTitle>
                <CardDescription>
                  JSON tabanlı veri saklama sistemini başlatır ve başlangıç verilerini yükler.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={initializeJsonStorage} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Başlatılıyor...' : 'JSON Storage Başlat'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Veri Yedekle
                </CardTitle>
                <CardDescription>
                  Tüm verileri JSON formatında yedekler ve indirir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={exportData} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Yedekleniyor...' : 'Veri Yedekle'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Veri Geri Yükle
                </CardTitle>
                <CardDescription>
                  JSON yedek dosyasından verileri geri yükler.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Veri Geri Yükle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <RefreshCw className="h-5 w-5" />
                  JSON Storage Sıfırla
                </CardTitle>
                <CardDescription>
                  Tüm JSON verilerini siler ve başlangıç verilerini yeniden yükler.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={resetJsonStorage} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? 'Sıfırlanıyor...' : 'JSON Storage Sıfırla'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
