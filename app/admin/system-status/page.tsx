"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Server, Globe, Settings } from 'lucide-react'

interface SystemStatus {
  database: {
    status: 'connected' | 'error' | 'testing'
    message: string
    details?: any
  }
  apis: {
    menus: { status: 'success' | 'error' | 'testing', message: string, data?: any }
    pages: { status: 'success' | 'error' | 'testing', message: string, data?: any }
    blog: { status: 'success' | 'error' | 'testing', message: string, data?: any }
    demos: { status: 'success' | 'error' | 'testing', message: string, data?: any }
    categories: { status: 'success' | 'error' | 'testing', message: string, data?: any }
  }
  environment: {
    nodeEnv: string
    appUrl: string
    siteUrl: string
    dbHost: string
    dbName: string
    supabaseUrl: string
    supabaseKey: string
  }
  build: {
    timestamp: string
    version: string
    platform: string
  }
}

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSystemCheck = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Environment bilgilerini topla
      const environment = {
        nodeEnv: process.env.NODE_ENV || 'development',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
        dbHost: process.env.DB_HOST || 'Not set',
        dbName: process.env.DB_NAME || 'Not set',
        dbUser: process.env.DB_USER || 'Not set',
        dbPort: process.env.DB_PORT || 'Not set'
      }

      // Build bilgilerini topla
      const build = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        platform: typeof window !== 'undefined' ? 'client' : 'server'
      }

      // Database test
      const dbResponse = await fetch('/api/debug/database')
      const dbResult = await dbResponse.json()

      // API testleri
      const apiTests = {
        menus: { status: 'testing' as const, message: 'Testing...' },
        pages: { status: 'testing' as const, message: 'Testing...' },
        blog: { status: 'testing' as const, message: 'Testing...' },
        demos: { status: 'testing' as const, message: 'Testing...' },
        categories: { status: 'testing' as const, message: 'Testing...' }
      }

      setStatus({
        database: {
          status: dbResult.success ? 'connected' : 'error',
          message: dbResult.message,
          details: dbResult
        },
        apis: apiTests,
        environment,
        build
      })

      // API testlerini sırayla çalıştır
      const apiEndpoints = [
        { key: 'menus', url: '/api/menus' },
        { key: 'pages', url: '/api/pages' },
        { key: 'blog', url: '/api/blog' },
        { key: 'demos', url: '/api/demos' },
        { key: 'categories', url: '/api/categories' }
      ]

      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint.url)
          const data = await response.json()
          
          setStatus(prev => prev ? {
            ...prev,
            apis: {
              ...prev.apis,
              [endpoint.key]: {
                status: response.ok ? 'success' : 'error',
                message: response.ok ? `✅ ${endpoint.key} API çalışıyor` : `❌ ${endpoint.key} API hatası`,
                data: response.ok ? data : null
              }
            }
          } : null)
        } catch (error) {
          setStatus(prev => prev ? {
            ...prev,
            apis: {
              ...prev.apis,
              [endpoint.key]: {
                status: 'error',
                message: `❌ ${endpoint.key} API bağlantı hatası: ${error}`,
                data: null
              }
            }
          } : null)
        }
      }

    } catch (error) {
      setError(`Sistem kontrolü hatası: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <Badge variant="default" className="bg-green-500">Çalışıyor</Badge>
      case 'error':
        return <Badge variant="destructive">Hata</Badge>
      case 'testing':
        return <Badge variant="secondary">Test Ediliyor</Badge>
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>
    }
  }

  useEffect(() => {
    runSystemCheck()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistem Durumu</h1>
          <p className="text-muted-foreground">Sistem bileşenlerinin durumunu kontrol edin</p>
        </div>
        <Button onClick={runSystemCheck} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
          Yeniden Test Et
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Database Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veritabanı</CardTitle>
              {getStatusIcon(status.database.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(status.database.status)}
                <p className="text-sm text-muted-foreground">{status.database.message}</p>
                {status.database.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">Detaylar</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(status.database.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
              <CardDescription>API servislerinin durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(status.apis).map(([key, api]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(api.status)}
                      <span className="font-medium capitalize">{key}</span>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(api.status)}
                      <p className="text-xs text-muted-foreground mt-1">{api.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environment */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Environment Variables</CardTitle>
              <CardDescription>Sistem ortam değişkenleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>NODE_ENV:</span>
                  <Badge variant="outline">{status.environment.nodeEnv}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>APP_URL:</span>
                  <Badge variant="outline">{status.environment.appUrl}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>SITE_URL:</span>
                  <Badge variant="outline">{status.environment.siteUrl}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DB_HOST:</span>
                  <Badge variant="outline">{status.environment.dbHost}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DB_NAME:</span>
                  <Badge variant="outline">{status.environment.dbName}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DB_USER:</span>
                  <Badge variant="outline">{status.environment.dbUser}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DB_PORT:</span>
                  <Badge variant="outline">{status.environment.dbPort}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Build Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Build Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <Badge variant="outline">{status.build.version}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <Badge variant="outline">{status.build.platform}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <Badge variant="outline">{new Date(status.build.timestamp).toLocaleString('tr-TR')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raw Data */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ham Sistem Verisi</CardTitle>
            <CardDescription>Debug için tüm sistem verisi</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(status, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
