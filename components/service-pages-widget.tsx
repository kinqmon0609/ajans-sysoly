'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cleanAndTruncateContent } from '@/lib/utils';

interface ServicePage {
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

interface ServicePagesWidgetProps {
  showActions?: boolean;
  limit?: number;
  className?: string;
  showInactive?: boolean;
}

export default function ServicePagesWidget({ 
  showActions = false, 
  limit = 10,
  className = "",
  showInactive = false
}: ServicePagesWidgetProps) {
  const [pages, setPages] = useState<ServicePage[]>([]);
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

  const getServiceIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'e-ticaret':
        return '🛒';
      case 'özel yazılım':
        return '💻';
      case 'mobil uygulama':
        return '📱';
      case 'dijital pazarlama':
        return '📈';
      case 'web tasarım':
        return '🎨';
      default:
        return '📄';
    }
  };

  const getServiceColor = (title: string) => {
    switch (title.toLowerCase()) {
      case 'e-ticaret':
        return 'from-green-50 to-emerald-50 border-green-200 hover:shadow-green-100';
      case 'özel yazılım':
        return 'from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-100';
      case 'mobil uygulama':
        return 'from-purple-50 to-violet-50 border-purple-200 hover:shadow-purple-100';
      case 'dijital pazarlama':
        return 'from-orange-50 to-amber-50 border-orange-200 hover:shadow-orange-100';
      case 'web tasarım':
        return 'from-pink-50 to-rose-50 border-pink-200 hover:shadow-pink-100';
      default:
        return 'from-gray-50 to-slate-50 border-gray-200 hover:shadow-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
    <div className={`space-y-6 ${className}`}>
      {displayPages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Henüz hizmet sayfası eklenmemiş.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPages.map((page) => (
            <Card 
              key={page.id} 
              className={`bg-gradient-to-br ${getServiceColor(page.title)} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getServiceIcon(page.title)}</span>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      {page.title}
                    </CardTitle>
                  </div>
                  <Badge variant={page.is_active ? "default" : "secondary"}>
                    {page.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {page.meta_description || cleanAndTruncateContent(page.content, 120)}
                </p>
                
                {showActions && (
                  <div className="flex space-x-2 mb-4">
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
                
                <div className="flex justify-between items-center">
                  <Link href={`/${page.slug}`}>
                    <Button className="bg-white/80 hover:bg-white text-gray-800 border border-gray-300 shadow-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Detayları Gör
                    </Button>
                  </Link>
                  <Link href={`/${page.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Slug: {page.slug}</span>
                    <span>{new Date(page.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
