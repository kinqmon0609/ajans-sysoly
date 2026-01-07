"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"
import { 
  Loader2, Save, Mail, Phone, MapPin, Clock, Search, Settings2,
  Plus, Edit, Trash2, Shield, User, Eye, AlertTriangle, Info, XCircle,
  Database, Download, CheckCircle, AlertCircle
} from "lucide-react"

// ===== TYPES =====
interface Setting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: string
  category: string
  label: string
  description: string
}

interface UserType {
  id: string
  username: string
  email: string
  full_name?: string
  role: 'admin' | 'editor' | 'viewer'
  is_active: boolean
  last_login_at?: string
  created_at: string
}

interface SecurityLog {
  id: string
  event_type: string
  severity: 'info' | 'warning' | 'critical'
  ip_address?: string
  user_id?: string
  username?: string
  description?: string
  created_at: string
}

interface IPRule {
  id: string
  ip_address: string
  type: 'whitelist' | 'blacklist'
  reason?: string
  is_active: boolean
  created_at: string
}

interface Backup {
  id: string
  filename: string
  file_path: string
  file_size?: number
  backup_type: 'manual' | 'automatic'
  status: 'in_progress' | 'completed' | 'failed'
  created_by?: string
  created_by_username?: string
  created_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Users state
  const [users, setUsers] = useState<UserType[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "viewer" as 'admin' | 'editor' | 'viewer',
    is_active: true
  })

  // Security state
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [ipRules, setIpRules] = useState<IPRule[]>([])
  const [securityLoading, setSecurityLoading] = useState(false)
  const [logFilter, setLogFilter] = useState<string>("all")
  const [isAddingIP, setIsAddingIP] = useState(false)
  const [ipFormData, setIpFormData] = useState({
    ip_address: "",
    type: "blacklist" as 'whitelist' | 'blacklist',
    reason: ""
  })

  // Backups state
  const [backups, setBackups] = useState<Backup[]>([])
  const [backupsLoading, setBackupsLoading] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  // ===== GENERAL SETTINGS =====
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const updates = settings.map((s) => ({
        setting_key: s.setting_key,
        setting_value: s.setting_value,
      }))

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: "Ayarlar kaydedildi.",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilemedi.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.setting_key === key ? { ...s, setting_value: value } : s))
    )
  }

  const contactSettings = settings.filter((s) => s.category === "contact")
  const seoSettings = settings.filter((s) => s.category === "seo")
  const generalSettings = settings.filter((s) => s.category === "general")

  // ===== USERS MANAGEMENT =====
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch("/api/users", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      sonnerToast.error("Kullanıcılar yüklenemedi")
    } finally {
      setUsersLoading(false)
    }
  }

  const handleOpenUserForm = (user?: UserType) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        username: user.username,
        email: user.email,
        password: "",
        full_name: user.full_name || "",
        role: user.role,
        is_active: user.is_active
      })
    } else {
      setEditingUser(null)
      setUserFormData({
        username: "",
        email: "",
        password: "",
        full_name: "",
        role: "viewer",
        is_active: true
      })
    }
    setIsUserFormOpen(true)
  }

  const handleSaveUser = async () => {
    if (!userFormData.username || !userFormData.email) {
      sonnerToast.error("Kullanıcı adı ve e-posta gereklidir")
      return
    }

    if (!editingUser && !userFormData.password) {
      sonnerToast.error("Yeni kullanıcı için şifre gereklidir")
      return
    }

    setIsSavingUser(true)

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userFormData)
      })

      if (response.ok) {
        sonnerToast.success(editingUser ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu")
        setIsUserFormOpen(false)
        fetchUsers()
      } else {
        const data = await response.json()
        sonnerToast.error(data.error || "İşlem başarısız")
      }
    } catch (error) {
      console.error("Save error:", error)
      sonnerToast.error("İşlem sırasında hata oluştu")
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        sonnerToast.success("Kullanıcı silindi")
        fetchUsers()
      } else {
        sonnerToast.error("Silme işlemi başarısız")
      }
    } catch (error) {
      console.error("Delete error:", error)
      sonnerToast.error("Silme sırasında hata oluştu")
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: any = {
      admin: { icon: Shield, color: "destructive" },
      editor: { icon: Edit, color: "default" },
      viewer: { icon: Eye, color: "secondary" }
    }
    const config = variants[role] || variants.viewer
    const Icon = config.icon

    return (
      <Badge variant={config.color as any}>
        <Icon className="mr-1 h-3 w-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  // ===== SECURITY MANAGEMENT =====
  const fetchSecurityData = async () => {
    setSecurityLoading(true)
    try {
      await Promise.all([fetchLogs(), fetchIPRules()])
    } finally {
      setSecurityLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      let url = "/api/security/logs?limit=100"
      if (logFilter !== "all") {
        url += `&severity=${logFilter}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      sonnerToast.error("Loglar yüklenemedi")
    }
  }

  const fetchIPRules = async () => {
    try {
      const response = await fetch("/api/security/ip-control", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIpRules(data.ipRules)
      }
    } catch (error) {
      console.error("Error fetching IP rules:", error)
    }
  }

  const handleAddIPRule = async () => {
    if (!ipFormData.ip_address) {
      sonnerToast.error("IP adresi gereklidir")
      return
    }

    try {
      const response = await fetch("/api/security/ip-control", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ipFormData)
      })

      if (response.ok) {
        sonnerToast.success("IP kuralı eklendi")
        setIsAddingIP(false)
        setIpFormData({ ip_address: "", type: "blacklist", reason: "" })
        fetchIPRules()
      } else {
        sonnerToast.error("Ekleme başarısız")
      }
    } catch (error) {
      console.error("Add IP rule error:", error)
      sonnerToast.error("Ekleme sırasında hata oluştu")
    }
  }

  const getSeverityBadge = (severity: string) => {
    const config: any = {
      info: { icon: Info, color: "default", label: "Bilgi" },
      warning: { icon: AlertTriangle, color: "secondary", label: "Uyarı" },
      critical: { icon: XCircle, color: "destructive", label: "Kritik" }
    }
    const severityConfig = config[severity] || config.info
    const Icon = severityConfig.icon

    return (
      <Badge variant={severityConfig.color as any}>
        <Icon className="mr-1 h-3 w-3" />
        {severityConfig.label}
      </Badge>
    )
  }

  // ===== BACKUPS MANAGEMENT =====
  const fetchBackups = async () => {
    setBackupsLoading(true)
    try {
      const response = await fetch("/api/backup/list", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
      sonnerToast.error("Yedekler yüklenemedi")
    } finally {
      setBackupsLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)

    try {
      const response = await fetch("/api/backup/create", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        sonnerToast.success("Yedek oluşturuldu!")
        fetchBackups()
      } else {
        const data = await response.json()
        sonnerToast.error(data.error || "Yedekleme başarısız")
      }
    } catch (error) {
      console.error("Create backup error:", error)
      sonnerToast.error("Yedekleme sırasında hata oluştu")
    } finally {
      setCreatingBackup(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Bilinmiyor'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground mt-1">Sistem ayarlarını yönetin</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="contact">İletişim</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="users" onClick={() => !users.length && fetchUsers()}>
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="security" onClick={() => !logs.length && fetchSecurityData()}>
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="backups" onClick={() => !backups.length && fetchBackups()}>
            Yedekler
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Genel Ayarlar
                  </CardTitle>
                  <CardDescription>Site genelinde kullanılan ayarlar</CardDescription>
                </div>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {generalSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>{setting.label}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                  <Input
                    id={setting.setting_key}
                    type={setting.setting_type}
                    value={setting.setting_value || ""}
                    onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    İletişim Bilgileri
                  </CardTitle>
                  <CardDescription>
                    İletişim sayfasında görünecek bilgileri düzenleyin
                  </CardDescription>
                </div>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactSettings.map((setting) => {
                const icons: Record<string, any> = {
                  contact_email: Mail,
                  contact_phone: Phone,
                  contact_address: MapPin,
                  contact_working_hours: Clock,
                }
                const Icon = icons[setting.setting_key]

                return (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.setting_key} className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      {setting.label}
                    </Label>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    )}
                    {setting.setting_type === "textarea" ? (
                      <Textarea
                        id={setting.setting_key}
                        value={setting.setting_value || ""}
                        onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={setting.setting_key}
                        type={setting.setting_type}
                        value={setting.setting_value || ""}
                        onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO Ayarları
                  </CardTitle>
                  <CardDescription>
                    Google ve diğer arama motorları için SEO ayarlarını yapın
                  </CardDescription>
                </div>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {seoSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>{setting.label}</Label>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  )}
                  {setting.setting_type === "textarea" ? (
                    <Textarea
                      id={setting.setting_key}
                      value={setting.setting_value || ""}
                      onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      rows={3}
                      placeholder={setting.description}
                    />
                  ) : (
                    <Input
                      id={setting.setting_key}
                      type={setting.setting_type}
                      value={setting.setting_value || ""}
                      onChange={(e) => updateSetting(setting.setting_key, e.target.value)}
                      placeholder={setting.description}
                    />
                  )}
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 SEO İpuçları</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Site başlığı 50-60 karakter arasında olmalı</li>
                  <li>• Meta açıklama 150-160 karakter arasında olmalı</li>
                  <li>• Anahtar kelimeleri virgülle ayırarak yazın (örn: web tasarım, mobil uygulama)</li>
                  <li>• Google Analytics ID'nizi Google Analytics panelinden alabilirsiniz</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
              <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
            </div>
            <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenUserForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Kullanıcı
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Kullanıcı Adı</Label>
                    <Input
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="kullaniciadi"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <Input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ad Soyad</Label>
                    <Input
                      value={userFormData.full_name}
                      onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Şifre {editingUser && "(Değiştirmek için doldurun)"}</Label>
                    <Input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder="********"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select value={userFormData.role} onValueChange={(value: any) => setUserFormData({ ...userFormData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Tam Yetki</SelectItem>
                        <SelectItem value="editor">Editor - Düzenleme Yetkisi</SelectItem>
                        <SelectItem value="viewer">Viewer - Sadece Görüntüleme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Aktif</Label>
                    <Switch
                      checked={userFormData.is_active}
                      onCheckedChange={(checked) => setUserFormData({ ...userFormData, is_active: checked })}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveUser} disabled={isSavingUser} className="flex-1">
                      {isSavingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {editingUser ? "Güncelle" : "Oluştur"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsUserFormOpen(false)} className="flex-1">
                      İptal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kullanıcılar ({users.length})</CardTitle>
              <CardDescription>Tüm sistem kullanıcıları</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.full_name || user.username}</p>
                            {getRoleBadge(user.role)}
                            {!user.is_active && <Badge variant="outline">Devre Dışı</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.last_login_at && (
                            <p className="text-xs text-muted-foreground">
                              Son giriş: {new Date(user.last_login_at).toLocaleString('tr-TR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenUserForm(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Henüz kullanıcı yok</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Management */}
        <TabsContent value="security" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Güvenlik Yönetimi</h2>
            <p className="text-muted-foreground">Güvenlik logları ve IP kontrolü</p>
          </div>

          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="logs">Güvenlik Logları</TabsTrigger>
              <TabsTrigger value="ip-control">IP Kontrolü</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <Select value={logFilter} onValueChange={(value) => { setLogFilter(value); fetchLogs(); }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="info">Bilgi</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Güvenlik Olayları</CardTitle>
                  <CardDescription>Son {logs.length} güvenlik olayı</CardDescription>
                </CardHeader>
                <CardContent>
                  {securityLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(log.severity)}
                              <span className="font-medium">{log.event_type}</span>
                            </div>
                            {log.description && (
                              <p className="text-sm text-muted-foreground">{log.description}</p>
                            )}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              {log.ip_address && <span>IP: {log.ip_address}</span>}
                              {log.username && <span>Kullanıcı: {log.username}</span>}
                              <span>{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {logs.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Henüz log kaydı yok</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ip-control" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isAddingIP} onOpenChange={setIsAddingIP}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      IP Kuralı Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni IP Kuralı</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>IP Adresi</Label>
                        <Input
                          value={ipFormData.ip_address}
                          onChange={(e) => setIpFormData({ ...ipFormData, ip_address: e.target.value })}
                          placeholder="192.168.1.1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tür</Label>
                        <Select 
                          value={ipFormData.type} 
                          onValueChange={(value: any) => setIpFormData({ ...ipFormData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blacklist">Kara Liste (Engelle)</SelectItem>
                            <SelectItem value="whitelist">Beyaz Liste (İzin Ver)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Sebep</Label>
                        <Input
                          value={ipFormData.reason}
                          onChange={(e) => setIpFormData({ ...ipFormData, reason: e.target.value })}
                          placeholder="Şüpheli aktivite"
                        />
                      </div>
                      
                      <Button onClick={handleAddIPRule} className="w-full">
                        Ekle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>IP Erişim Kuralları</CardTitle>
                  <CardDescription>Beyaz liste ve kara liste yönetimi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ipRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{rule.ip_address}</span>
                            <Badge variant={rule.type === 'blacklist' ? 'destructive' : 'default'}>
                              {rule.type === 'blacklist' ? 'Kara Liste' : 'Beyaz Liste'}
                            </Badge>
                            {!rule.is_active && <Badge variant="outline">Pasif</Badge>}
                          </div>
                          {rule.reason && (
                            <p className="text-sm text-muted-foreground mt-1">{rule.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(rule.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}

                    {ipRules.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Henüz IP kuralı yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Backups Management */}
        <TabsContent value="backups" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Veritabanı Yedekleri</h2>
              <p className="text-muted-foreground">Veritabanı yedeklerini yönetin</p>
            </div>
            <Button onClick={handleCreateBackup} disabled={creatingBackup}>
              {creatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Yeni Yedek Oluştur
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Önemli Bilgi</AlertTitle>
            <AlertDescription>
              Yedekler <code className="bg-muted px-1 py-0.5 rounded">/Applications/MAMP/htdocs/ajans1/backups/</code> klasöründe saklanır.
              Düzenli yedekleme yapmayı unutmayın!
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Yedek Listesi ({backups.length})</CardTitle>
              <CardDescription>Tüm veritabanı yedekleri</CardDescription>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{backup.filename}</p>
                            {backup.status === 'completed' && (
                              <Badge variant="outline">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Tamamlandı
                              </Badge>
                            )}
                            {backup.status === 'failed' && (
                              <Badge variant="destructive">Başarısız</Badge>
                            )}
                            {backup.backup_type === 'automatic' && (
                              <Badge variant="secondary">Otomatik</Badge>
                            )}
                          </div>
                          <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                            <span>{formatFileSize(backup.file_size)}</span>
                            <span>{new Date(backup.created_at).toLocaleString('tr-TR')}</span>
                            {backup.created_by_username && (
                              <span>Oluşturan: {backup.created_by_username}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" disabled>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {backups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Henüz yedek yok. Yukarıdaki butona tıklayarak ilk yedeğinizi oluşturun.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
