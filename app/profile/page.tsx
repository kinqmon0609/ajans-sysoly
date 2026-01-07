"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Shield, Smartphone, Key, Loader2, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [setupMode, setSetupMode] = useState(false)

  useEffect(() => {
    checkTwoFactorStatus()
  }, [])

  const checkTwoFactorStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/status", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.enabled)
      }
    } catch (error) {
      console.error("2FA status check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    setSetupMode(true)
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        toast.error("2FA kurulumu başlatılamadı")
        setSetupMode(false)
      }
    } catch (error) {
      console.error("2FA setup error:", error)
      toast.error("2FA kurulumu sırasında hata oluştu")
      setSetupMode(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Lütfen 6 haneli kodu girin")
      return
    }

    setVerifying(true)
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token: verificationCode })
      })
      
      if (response.ok) {
        toast.success("2FA başarıyla aktifleştirildi!")
        setTwoFactorEnabled(true)
        setSetupMode(false)
        setVerificationCode("")
        setQrCode("")
        setSecret("")
      } else {
        toast.error("Doğrulama kodu hatalı")
      }
    } catch (error) {
      console.error("2FA verify error:", error)
      toast.error("Doğrulama sırasında hata oluştu")
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm("2FA'yı devre dışı bırakmak istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        toast.success("2FA devre dışı bırakıldı")
        setTwoFactorEnabled(false)
      } else {
        toast.error("2FA devre dışı bırakılamadı")
      }
    } catch (error) {
      console.error("2FA disable error:", error)
      toast.error("İşlem sırasında hata oluştu")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profil & Güvenlik</h1>
          <p className="text-muted-foreground">Hesap güvenliğinizi yönetin</p>
        </div>

        <div className="space-y-6">
          {/* 2FA Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
                    <Shield className={`h-6 w-6 ${twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                  </div>
                  <div>
                    <CardTitle>İki Faktörlü Kimlik Doğrulama (2FA)</CardTitle>
                    <CardDescription>
                      Hesabınıza ekstra güvenlik katmanı ekleyin
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {twoFactorEnabled ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1 px-3 py-1">
                      <CheckCircle className="h-4 w-4" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1 px-3 py-1">
                      <XCircle className="h-4 w-4" />
                      Pasif
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!twoFactorEnabled && !setupMode && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      2FA Nedir?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      2FA, hesabınıza giriş yaparken şifrenizin yanı sıra telefonunuzdaki bir uygulamadan 
                      6 haneli kod girmenizi gerektirir. Bu sayede hesabınız çok daha güvenli hale gelir.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Önerilen uygulamalar:</strong> Google Authenticator, Microsoft Authenticator, Authy
                    </p>
                  </div>
                  <Button onClick={handleEnable2FA} className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    2FA'yı Aktifleştir
                  </Button>
                </div>
              )}

              {setupMode && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg">
                      {qrCode && (
                        <Image 
                          src={qrCode} 
                          alt="2FA QR Code" 
                          width={200} 
                          height={200}
                          className="mx-auto"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Adım 1: QR Kodu Tarayın</p>
                      <p className="text-sm text-muted-foreground">
                        Authenticator uygulamanız ile yukarıdaki QR kodu tarayın
                      </p>
                    </div>
                    {secret && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Manuel giriş için kod:</p>
                        <code className="text-sm font-mono">{secret}</code>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Adım 2: Doğrulama Kodunu Girin</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6 haneli kod"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleVerifyAndEnable} 
                        disabled={verifying || verificationCode.length !== 6}
                        className="flex-1"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Doğrulanıyor...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Doğrula ve Aktifleştir
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSetupMode(false)
                          setQrCode("")
                          setSecret("")
                          setVerificationCode("")
                        }}
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {twoFactorEnabled && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold">2FA Aktif</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hesabınız iki faktörlü kimlik doğrulama ile korunuyor. 
                      Giriş yaparken telefonunuzdaki authenticator uygulamasından kodu girmeniz gerekecek.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDisable2FA} className="w-full">
                    <XCircle className="mr-2 h-4 w-4" />
                    2FA'yı Devre Dışı Bırak
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Güvenlik İpuçları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Güçlü ve benzersiz bir şifre kullanın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>2FA kodlarınızı asla kimseyle paylaşmayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Yedek kodlarınızı güvenli bir yerde saklayın</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Şüpheli aktivite fark ederseniz hemen şifrenizi değiştirin</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}

