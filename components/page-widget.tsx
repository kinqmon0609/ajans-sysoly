'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cleanAndTruncateContent } from '@/lib/utils';

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: any;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface PageWidgetProps {
  showActions?: boolean;
  limit?: number;
  className?: string;
  showInactive?: boolean;
}

export default function PageWidget({ 
  showActions = false, 
  limit = 10,
  className = "",
  showInactive = false
}: PageWidgetProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [showInactive]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const url = showInactive ? '/api/pages?includeInactive=true' : '/api/pages';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Sayfalar yüklenemedi');
      }
      const data = await response.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Sayfa yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Sayfa silinemedi');
      }

      setPages(pages.filter(page => page.id !== id));
    } catch (err) {
      console.error('Sayfa silme hatası:', err);
      alert('Sayfa silinemedi');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Sayfa durumu güncellenemedi');
      }

      setPages(pages.map(page => 
        page.id === id ? { ...page, is_active: !currentStatus } : page
      ));
    } catch (err) {
      console.error('Sayfa durumu güncelleme hatası:', err);
      alert('Sayfa durumu güncellenemedi');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <p className="text-red-600">Hata: {error}</p>
        <Button 
          onClick={fetchPages} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const displayPages = pages.slice(0, limit);

  return (
    <div className={`space-y-4 ${className}`}>
      {showActions && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Sayfalar</h2>
          <Link href="/admin/pages">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Sayfa
            </Button>
          </Link>
        </div>
      )}

      {displayPages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Henüz sayfa eklenmemiş.</p>
            {showActions && (
              <Link href="/admin/pages">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Sayfayı Ekle
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-1">{page.title}</CardTitle>
                  <Badge variant={page.is_active ? "default" : "secondary"}>
                    {page.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {page.meta_description || cleanAndTruncateContent(page.content, 100)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Slug: {page.slug}</span>
                  <span>{new Date(page.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                
                {showActions && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(page.id, page.is_active)}
                    >
                      {page.is_active ? "Pasif Yap" : "Aktif Yap"}
                    </Button>
                    <Link href={`/admin/pages?edit=${page.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {!showActions && (
                  <div className="flex justify-between items-center">
                    <Link href={`/${page.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Görüntüle
                      </Button>
                    </Link>
                    <Link href={`/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
