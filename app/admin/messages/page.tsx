"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, MailOpen, Trash2, Phone, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      console.error("Mesajlar yükleme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      fetchContacts()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj okundu olarak işaretlenemedi",
        variant: "destructive",
      })
    }
  }

  const deleteContact = async () => {
    if (!deleteId) return

    try {
      await fetch(`/api/contacts/${deleteId}`, {
        method: "DELETE",
      })
      toast({
        title: "Başarılı",
        description: "Mesaj silindi",
      })
      fetchContacts()
      setDeleteId(null)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesaj silinemedi",
        variant: "destructive",
      })
    }
  }

  const unreadCount = contacts.filter((c) => !c.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İletişim Mesajları</h1>
          <p className="text-muted-foreground">
            Toplam {contacts.length} mesaj, {unreadCount} okunmamış
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">Henüz mesaj yok</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className={!contact.is_read ? "border-primary/50 bg-primary/5" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {contact.name}
                      {!contact.is_read && <Badge variant="default">Yeni</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(contact.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!contact.is_read && (
                      <Button variant="ghost" size="icon" onClick={() => markAsRead(contact.id)} title="Okundu işaretle">
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(contact.id)}
                      title="Sil"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Konu:</p>
                  <p className="text-sm text-muted-foreground">{contact.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Mesaj:</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{contact.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={deleteContact}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
