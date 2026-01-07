"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  demoId: string
}

export function CommentSection({ demoId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [demoId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?demo_id=${demoId}&approved=true`)
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Yorumlar yükleme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !content) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo_id: demoId,
          author_name: name,
          author_email: email,
          content,
        }),
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Yorumunuz onay için gönderildi",
        })
        setName("")
        setEmail("")
        setContent("")
      } else {
        throw new Error("Yorum gönderilemedi")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Yorum gönderilirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Yorumlar ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{comment.author_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Henüz yorum yok. İlk yorumu siz yapın!</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
            <h3 className="font-semibold">Yorum Yap</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Adınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <Textarea
              placeholder="Yorumunuz..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={4}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                "Yorum Gönder"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
