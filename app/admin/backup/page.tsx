'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');

  // Export işlemi
  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('');

    try {
      const response = await fetch('/api/backup/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export işlemi başarısız');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ajans1-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus('success');
      toast.success('Yedekleme başarıyla indirildi!');
    } catch (error) {
      setExportStatus('error');
      toast.error('Yedekleme işlemi başarısız!');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Import işlemi
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Lütfen bir dosya seçin!');
      return;
    }

    setIsImporting(true);
    setImportStatus('');

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import işlemi başarısız');
      }

      const result = await response.json();
      setImportStatus('success');
      toast.success(`Import başarılı! ${result.importedRecords} kayıt yüklendi.`);
    } catch (error) {
      setImportStatus('error');
      toast.error('Import işlemi başarısız!');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Dosya seçimi
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
      setImportStatus('');
    } else {
      toast.error('Lütfen geçerli bir JSON dosyası seçin!');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veri Yedekleme</h1>
          <p className="text-muted-foreground">
            Tüm verilerinizi yedekleyin ve geri yükleyin
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Veri Export
            </CardTitle>
            <CardDescription>
              Tüm verilerinizi JSON formatında indirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Menüler, sayfalar, blog yazıları, demolar ve daha fazlası</span>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Yedekleniyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Yedekle ve İndir
                </>
              )}
            </Button>

            {exportStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Yedekleme başarıyla tamamlandı ve indirildi!
                </AlertDescription>
              </Alert>
            )}

            {exportStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Yedekleme işlemi başarısız oldu. Lütfen tekrar deneyin.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Veri Import
            </CardTitle>
            <CardDescription>
              JSON yedek dosyasından verileri geri yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Yedek Dosyası Seçin</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              {importFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{importFile.name} ({(importFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleImport} 
              disabled={!importFile || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Verileri Yükle
                </>
              )}
            </Button>

            {importStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import işlemi başarıyla tamamlandı!
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Import işlemi başarısız oldu. Dosya formatını kontrol edin.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bilgi Kartı */}
      <Card>
        <CardHeader>
          <CardTitle>Yedekleme Hakkında</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Export İçeriği:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Menü yapısı ve öğeleri</li>
                <li>• Tüm sayfalar ve içerikleri</li>
                <li>• Blog yazıları ve kategorileri</li>
                <li>• Demo projeleri</li>
                <li>• Paket bilgileri</li>
                <li>• Site ayarları</li>
                <li>• Kullanıcı verileri</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Import Özellikleri:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Mevcut verileri temizler</li>
                <li>• Yedek dosyasındaki verileri yükler</li>
                <li>• Tablo yapılarını otomatik oluşturur</li>
                <li>• Hata durumunda geri alır</li>
                <li>• İşlem loglarını gösterir</li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Import işlemi mevcut tüm verileri siler ve yedek dosyasındaki verilerle değiştirir. 
              İşlem öncesi mutlaka yedek alın!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
