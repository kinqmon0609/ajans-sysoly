'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryWidgetProps {
  showActions?: boolean;
  limit?: number;
  className?: string;
}

export default function CategoryWidget({ 
  showActions = false, 
  limit = 10,
  className = ""
}: CategoryWidgetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Kategoriler yüklenemedi');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Kategori yükleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kategori silinemedi');
      }

      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Kategori silme hatası:', err);
      alert('Kategori silinemedi');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Kategori durumu güncellenemedi');
      }

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, is_active: !currentStatus } : cat
      ));
    } catch (err) {
      console.error('Kategori durumu güncelleme hatası:', err);
      alert('Kategori durumu güncellenemedi');
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
          onClick={fetchCategories} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const displayCategories = categories.slice(0, limit);

  return (
    <div className={`space-y-4 ${className}`}>
      {showActions && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Kategoriler</h2>
          <Link href="/admin/categories">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kategori
            </Button>
          </Link>
        </div>
      )}

      {displayCategories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Henüz kategori eklenmemiş.</p>
            {showActions && (
              <Link href="/admin/categories">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Kategoriyi Ekle
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
                
                {showActions && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(category.id, category.is_active)}
                    >
                      {category.is_active ? "Pasif Yap" : "Aktif Yap"}
                    </Button>
                    <Link href={`/admin/categories?edit=${category.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {!showActions && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Slug: {category.slug}</span>
                    <span>{new Date(category.created_at).toLocaleDateString('tr-TR')}</span>
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
