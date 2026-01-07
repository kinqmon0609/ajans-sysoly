"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Hash,
  Eye,
  Clock
} from "lucide-react"

interface SEOAnalysis {
  score: number
  title: {
    length: number
    optimal: boolean
    status: 'good' | 'warning' | 'error'
  }
  metaDescription: {
    length: number
    optimal: boolean
    status: 'good' | 'warning' | 'error'
  }
  content: {
    wordCount: number
    optimal: boolean
    status: 'good' | 'warning' | 'error'
  }
  keyword: {
    density: number
    occurrences: number
    status: 'good' | 'warning' | 'error'
  }
  readingTime: number
  readability: {
    score: number
    level: string
  }
}

interface SEOAnalyzerProps {
  title: string
  metaDescription: string
  content: string
  focusKeyword: string
}

export function SEOAnalyzer({ title, metaDescription, content, focusKeyword }: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)

  useEffect(() => {
    const analyze = () => {
      // Title analysis
      const titleLength = title.length
      const titleOptimal = titleLength >= 50 && titleLength <= 60
      const titleStatus: 'good' | 'warning' | 'error' = 
        titleLength === 0 ? 'error' :
        titleLength < 40 ? 'warning' :
        titleLength > 70 ? 'warning' :
        titleOptimal ? 'good' : 'warning'

      // Meta description analysis
      const metaLength = metaDescription.length
      const metaOptimal = metaLength >= 150 && metaLength <= 160
      const metaStatus: 'good' | 'warning' | 'error' = 
        metaLength === 0 ? 'error' :
        metaLength < 120 ? 'warning' :
        metaLength > 170 ? 'warning' :
        metaOptimal ? 'good' : 'warning'

      // Content analysis
      const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const words = cleanContent.split(' ').filter(word => word.length > 0)
      const wordCount = words.length
      const contentOptimal = wordCount >= 300
      const contentStatus: 'good' | 'warning' | 'error' = 
        wordCount === 0 ? 'error' :
        wordCount < 300 ? 'warning' :
        'good'

      // Keyword analysis
      const keyword = focusKeyword.toLowerCase()
      const contentLower = cleanContent.toLowerCase()
      const titleLower = title.toLowerCase()
      
      let keywordOccurrences = 0
      if (keyword) {
        const regex = new RegExp(keyword, 'gi')
        const matches = contentLower.match(regex)
        keywordOccurrences = matches ? matches.length : 0
        
        // Also check in title
        if (titleLower.includes(keyword)) {
          keywordOccurrences += 2 // Title keywords count more
        }
      }
      
      const keywordDensity = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0
      const keywordOptimal = keywordDensity >= 0.5 && keywordDensity <= 2.5
      const keywordStatus: 'good' | 'warning' | 'error' = 
        !keyword ? 'error' :
        keywordOccurrences === 0 ? 'error' :
        keywordOptimal ? 'good' : 'warning'

      // Reading time (average 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200)

      // Readability score (simplified Flesch reading ease)
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1
      const avgWordsPerSentence = wordCount / sentences
      const readabilityScore = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (cleanContent.length / wordCount))
      ))
      
      const readabilityLevel = 
        readabilityScore >= 70 ? 'Kolay' :
        readabilityScore >= 50 ? 'Orta' :
        readabilityScore >= 30 ? 'Zor' : 'Çok Zor'

      // Calculate overall SEO score
      let score = 0
      
      // Title (20 points)
      if (titleStatus === 'good') score += 20
      else if (titleStatus === 'warning') score += 10
      
      // Meta description (20 points)
      if (metaStatus === 'good') score += 20
      else if (metaStatus === 'warning') score += 10
      
      // Content length (25 points)
      if (contentStatus === 'good') score += 25
      else if (contentStatus === 'warning') score += 12
      
      // Keyword usage (25 points)
      if (keywordStatus === 'good') score += 25
      else if (keywordStatus === 'warning') score += 12
      
      // Readability (10 points)
      score += Math.min(10, readabilityScore / 10)

      setAnalysis({
        score,
        title: {
          length: titleLength,
          optimal: titleOptimal,
          status: titleStatus
        },
        metaDescription: {
          length: metaLength,
          optimal: metaOptimal,
          status: metaStatus
        },
        content: {
          wordCount,
          optimal: contentOptimal,
          status: contentStatus
        },
        keyword: {
          density: keywordDensity,
          occurrences: keywordOccurrences,
          status: keywordStatus
        },
        readingTime,
        readability: {
          score: readabilityScore,
          level: readabilityLevel
        }
      })
    }

    analyze()
  }, [title, metaDescription, content, focusKeyword])

  if (!analysis) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Mükemmel'
    if (score >= 60) return 'İyi'
    if (score >= 40) return 'Orta'
    return 'Zayıf'
  }

  const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'error' }) => {
    if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status === 'warning') return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SEO Analizi
            </CardTitle>
            <CardDescription>Gerçek zamanlı SEO optimizasyon puanı</CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
              {Math.round(analysis.score) || 0}
            </div>
            <Badge className={getScoreBgColor(analysis.score)}>
              {getScoreLabel(analysis.score) || "Değerlendiriliyor"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <Progress value={analysis.score} className="h-2" />
        </div>

        {/* Title Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon status={analysis.title.status} />
              <span className="font-medium">Başlık Uzunluğu</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysis.title.length} karakter
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {analysis.title.length === 0 
              ? '❌ Başlık girmelisiniz' 
              : analysis.title.optimal 
                ? '✅ Optimal uzunlukta (50-60 karakter)' 
                : `⚠️ Önerilen: 50-60 karakter (Şu an: ${analysis.title.length})`
            }
          </p>
        </div>

        {/* Meta Description Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon status={analysis.metaDescription.status} />
              <span className="font-medium">Meta Description</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysis.metaDescription.length} karakter
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {analysis.metaDescription.length === 0 
              ? '❌ Meta açıklama girmelisiniz' 
              : analysis.metaDescription.optimal 
                ? '✅ Optimal uzunlukta (150-160 karakter)' 
                : `⚠️ Önerilen: 150-160 karakter (Şu an: ${analysis.metaDescription.length})`
            }
          </p>
        </div>

        {/* Content Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon status={analysis.content.status} />
              <FileText className="h-4 w-4" />
              <span className="font-medium">İçerik Uzunluğu</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysis.content.wordCount} kelime
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {analysis.content.wordCount === 0 
              ? '❌ İçerik girmelisiniz' 
              : analysis.content.optimal 
                ? '✅ Yeterli uzunlukta (300+ kelime)' 
                : `⚠️ Minimum 300 kelime önerilir (Şu an: ${analysis.content.wordCount})`
            }
          </p>
        </div>

        {/* Keyword Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon status={analysis.keyword.status} />
              <Hash className="h-4 w-4" />
              <span className="font-medium">Anahtar Kelime</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analysis.keyword.occurrences}x ({analysis.keyword.density.toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {!focusKeyword 
              ? '❌ Odak kelime belirlemelisiniz' 
              : analysis.keyword.occurrences === 0 
                ? '❌ Anahtar kelime içerikte bulunamadı' 
                : analysis.keyword.status === 'good' 
                  ? '✅ Optimal yoğunlukta (0.5%-2.5%)' 
                  : `⚠️ Anahtar kelime yoğunluğu ${analysis.keyword.density < 0.5 ? 'düşük' : 'yüksek'}`
            }
          </p>
        </div>

        {/* Reading Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{analysis.readingTime} dk</div>
              <div className="text-xs text-muted-foreground">Okuma Süresi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{analysis.readability.level}</div>
              <div className="text-xs text-muted-foreground">Okunabilirlik</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

