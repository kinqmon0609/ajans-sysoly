"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Mail, Users, Send, Loader2, CheckCircle, XCircle, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Subscriber {
  id: string
  email: string
  name?: string
  is_active: boolean
  is_verified: boolean
  subscribed_at: string
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [campaignData, setCampaignData] = useState({
    subject: "",
    content: ""
  })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/newsletter/subscribers", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers)
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast.error("Aboneler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!campaignData.subject || !campaignData.content) {
      toast.error("Konu ve içerik gereklidir")
      return
    }

    setSending(true)

    try {
      // Bu endpoint'i oluşturmadık ama burada çağırılacak
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        toast.success("Kampanya gönderildi!")
        setCampaignData({ subject: "", content: "" })
      } else {
        toast.error("Gönderim başarısız")
      }
    } catch (error) {
      console.error("Send error:", error)
      toast.error("Gönderim sırasında hata oluştu")
    } finally {
      setSending(false)
    }
  }

  const activeSubscribers = subscribers.filter(s => s.is_active && s.is_verified)
  const inactiveSubscribers = subscribers.filter(s => !s.is_active || !s.is_verified)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Newsletter Yönetimi</h1>
        <p className="text-muted-foreground">E-posta kampanyaları ve aboneler</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Abone</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abone</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif Abone</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveSubscribers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Aboneler</TabsTrigger>
          <TabsTrigger value="campaign">Yeni Kampanya</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abone Listesi</CardTitle>
              <CardDescription>Tüm newsletter aboneleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{subscriber.email}</p>
                        {subscriber.name && (
                          <p className="text-sm text-muted-foreground">{subscriber.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(subscriber.subscribed_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {subscriber.is_verified ? (
                        <Badge variant="outline">Doğrulandı</Badge>
                      ) : (
                        <Badge variant="secondary">Doğrulanmadı</Badge>
                      )}
                      {subscriber.is_active ? (
                        <Badge>Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Pasif</Badge>
                      )}
                    </div>
                  </div>
                ))}

                {subscribers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Henüz abone yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-posta Kampanyası Oluştur</CardTitle>
              <CardDescription>
                {activeSubscribers.length} aktif aboneye gönderilecek
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Konu</Label>
                <Input
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                  placeholder="E-posta konusu"
                />
              </div>

              <div className="space-y-2">
                <Label>İçerik</Label>
                <Textarea
                  value={campaignData.content}
                  onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                  placeholder="E-posta içeriği (HTML destekler)"
                  rows={12}
                />
                <p className="text-xs text-muted-foreground">
                  HTML etiketlerini kullanabilirsiniz. Örnek: &lt;b&gt;kalın&lt;/b&gt;, &lt;i&gt;italik&lt;/i&gt;
                </p>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" disabled={!campaignData.subject || !campaignData.content}>
                      <Eye className="mr-2 h-4 w-4" />
                      Önizle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>E-posta Önizleme</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Email Header */}
                      <div className="bg-primary/10 p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Konu:</p>
                        <p className="font-semibold">{campaignData.subject || "Konu belirtilmedi"}</p>
                      </div>
                      
                      {/* Email Body */}
                      <div className="border rounded-lg p-6 bg-background">
                        <div 
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: campaignData.content || "<p>İçerik belirtilmedi</p>" }}
                        />
                      </div>

                      {/* Email Footer */}
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">
                          Bu e-posta {activeSubscribers.length} aktif aboneye gönderilecektir.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button onClick={handleSendCampaign} disabled={sending} className="flex-1">
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Kampanyayı Gönder
                    </>
                  )}
                </Button>
              </div>

              {sending && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ⏳ Kampanya gönderiliyor... Bu işlem birkaç dakika sürebilir.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

