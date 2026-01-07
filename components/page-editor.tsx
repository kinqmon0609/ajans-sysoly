"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"
import { 
  Plus, 
  Trash2, 
  Move, 
  Type, 
  Image, 
  Layout, 
  Settings,
  Save,
  Eye,
  HelpCircle,
  Columns,
  DollarSign
} from "lucide-react"

interface Section {
  id: string
  type: string
  title?: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  buttonText?: string
  buttonUrl?: string
  animationSpeed?: number // Kayan yazı hızı (saniye cinsinden)
  children?: Section[] // İç içe widget'lar için
  columns?: Array<{
    id: string
    width?: string // 'full', 'half', 'third', 'two-thirds'
    content?: string
    imageUrl?: string
    title?: string
    description?: string
    children?: Section[] // Kolonun içine widget eklenebilir
  }>
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
    label?: string
    imageUrl?: string
    url?: string
  }>
  style?: {
    backgroundColor?: string
    textColor?: string
    padding?: string
    marginTop?: string
    marginBottom?: string
    borderRadius?: string
    alignment?: string
    useGradient?: boolean
    gradientFrom?: string
    gradientTo?: string
    gradientDirection?: string
  }
}

interface PageEditorProps {
  page: any
  onSave: (content: any) => void
}

const WIDGET_TYPES = [
  { type: "container", label: "Container", icon: Layout, description: "İçine widget eklenebilir alan", droppable: true },
  { type: "columns", label: "Kolonlar", icon: Columns, description: "Solda resim, sağda yazı düzeni" },
  { type: "features-box", label: "Özellik Kutuları", icon: Layout, description: "Sol yazı + sağ 4 kutu" },
  { type: "service-cards", label: "Hizmet Kartları", icon: Layout, description: "6 adet hizmet kartı" },
  { type: "pricing", label: "Paketler / Fiyatlandırma", icon: DollarSign, description: "Fiyat paketleri" },
  { type: "hero", label: "Hero Section", icon: Layout, description: "Ana başlık ve açıklama" },
  { type: "features", label: "Özellikler", icon: Settings, description: "Özellik listesi" },
  { type: "content", label: "İçerik", icon: Type, description: "Metin içeriği" },
  { type: "stats", label: "İstatistikler", icon: Image, description: "Sayısal veriler" },
  { type: "faq", label: "SSS / FAQ", icon: HelpCircle, description: "Sıkça sorulan sorular" },
  { type: "slider", label: "Slider", icon: Image, description: "Resim slider'ı" },
  { type: "image", label: "Resim", icon: Image, description: "Tek resim" },
  { type: "marquee", label: "Kayan Yazı", icon: Move, description: "Animasyonlu metin" },
  { type: "gallery", label: "Galeri", icon: Layout, description: "Resim galerisi" },
  { type: "video", label: "Video", icon: Image, description: "Video içeriği" },
  { type: "cta", label: "CTA Button", icon: Plus, description: "Harekete geçirici buton" },
]

export function PageEditor({ page, onSave }: PageEditorProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null) // Soldan sürüklenen widget tipi
  const [dropTarget, setDropTarget] = useState<string | null>(null) // Nereye bırakılacak (container ID)

  useEffect(() => {
    if (page?.content) {
      let loadedSections: Section[] = []
      
      if (Array.isArray(page.content)) {
        loadedSections = page.content
      } else if (page.content.sections && Array.isArray(page.content.sections)) {
        loadedSections = page.content.sections
      }
      
      // Her section'ın ID'si yoksa ekle
      const sectionsWithIds = loadedSections.map((section, index) => ({
        ...section,
        id: section.id || `section-${Date.now()}-${index}`
      }))
      
      setSections(sectionsWithIds)
    }
  }, [page])

  const addSection = (type: string, parentId?: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: "",
      subtitle: "",
      description: "",
      content: "",
      items: type === "features-box" ? [
        { title: "Özellik 1", description: "Açıklama", icon: "Zap" },
        { title: "Özellik 2", description: "Açıklama", icon: "Shield" },
        { title: "Özellik 3", description: "Açıklama", icon: "Star" },
        { title: "Özellik 4", description: "Açıklama", icon: "Target" }
      ] : type === "service-cards" ? [
        { title: "Hizmet 1", description: "Açıklama", icon: "Code", url: "#" },
        { title: "Hizmet 2", description: "Açıklama", icon: "ShoppingCart", url: "#" },
        { title: "Hizmet 3", description: "Açıklama", icon: "Smartphone", url: "#" },
        { title: "Hizmet 4", description: "Açıklama", icon: "Palette", url: "#" },
        { title: "Hizmet 5", description: "Açıklama", icon: "TrendingUp", url: "#" },
        { title: "Hizmet 6", description: "Açıklama", icon: "PenTool", url: "#" }
      ] : [],
      // Container için boş children array
      children: type === "container" ? [] : undefined,
      // Columns için varsayılan 2 kolon oluştur
      columns: type === "columns" ? [
        { id: `col-${Date.now()}-1`, width: "half", content: "", title: "", imageUrl: "", description: "", children: [] },
        { id: `col-${Date.now()}-2`, width: "half", content: "", title: "", imageUrl: "", description: "", children: [] }
      ] : undefined
    }
    
    if (parentId) {
      // Eğer parent ID varsa, o container'ın içine ekle
      addToContainer(parentId, newSection)
    } else {
      // Yoksa ana listeye ekle
      setSections([...sections, newSection])
      setSelectedSection(newSection.id)
    }
  }

  // Container içine widget ekleme (recursive)
  const addToContainer = (containerId: string, newWidget: Section) => {
    const addRecursive = (items: Section[]): Section[] => {
      return items.map(item => {
        if (item.id === containerId) {
          return {
            ...item,
            children: [...(item.children || []), newWidget]
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addRecursive(item.children)
          }
        }
        return item
      })
    }
    
    setSections(addRecursive(sections))
    setSelectedSection(newWidget.id)
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    const updateRecursive = (items: Section[]): Section[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, ...updates }
        }
        // Children içinde ara
        if (item.children) {
          return {
            ...item,
            children: updateRecursive(item.children)
          }
        }
        // Columns içindeki children'larda ara
        if (item.columns) {
          return {
            ...item,
            columns: item.columns.map(col => ({
              ...col,
              children: col.children ? updateRecursive(col.children) : []
            }))
          }
        }
        return item
      })
    }
    
    setSections(updateRecursive(sections))
  }

  const deleteSection = (id: string) => {
    const deleteRecursive = (items: Section[]): Section[] => {
      return items.filter(item => item.id !== id).map(item => {
        // Children içinde ara
        if (item.children) {
          return {
            ...item,
            children: deleteRecursive(item.children)
          }
        }
        // Columns içindeki children'larda ara
        if (item.columns) {
          return {
            ...item,
            columns: item.columns.map(col => ({
              ...col,
              children: col.children ? deleteRecursive(col.children) : []
            }))
          }
        }
        return item
      })
    }
    
    setSections(deleteRecursive(sections))
    if (selectedSection === id) {
      setSelectedSection(null)
    }
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)
    setSections(newSections)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    moveSection(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDraggedWidget(null)
    setDropTarget(null)
  }

  // Sol sidebar'dan widget sürükleme başlat
  const handleWidgetDragStart = (widgetType: string) => {
    setDraggedWidget(widgetType)
  }

  // Container üzerine geldiğinde
  const handleContainerDragOver = (e: React.DragEvent, containerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(containerId)
  }

  // Container'dan ayrıldığında
  const handleContainerDragLeave = () => {
    setDropTarget(null)
  }

  // Kolon üzerine geldiğinde
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(columnId)
  }

  // Container'a bırakıldığında
  const handleContainerDrop = (e: React.DragEvent, containerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedWidget) {
      // Yeni widget ekle
      addSection(draggedWidget, containerId)
    }
    
    setDraggedWidget(null)
    setDropTarget(null)
  }

  // Kolona bırakıldığında
  const handleColumnDrop = (e: React.DragEvent, sectionId: string, columnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedWidget) {
      // Yeni widget oluştur
      const newWidget: Section = {
        id: `section-${Date.now()}`,
        type: draggedWidget,
        title: "",
        subtitle: "",
        description: "",
        content: "",
        items: [],
        children: draggedWidget === "container" ? [] : undefined
      }
      
      // Recursive olarak kolonu bul ve widget ekle
      const addToColumn = (items: Section[]): Section[] => {
        return items.map(item => {
          if (item.id === sectionId && item.columns) {
            // Bu section'ın kolonlarını güncelle
            return {
              ...item,
              columns: item.columns.map(col => {
                if (col.id === columnId) {
                  return {
                    ...col,
                    children: [...(col.children || []), newWidget]
                  }
                }
                return col
              })
            }
          }
          // Recursive olarak children'larda ara
          if (item.children) {
            return {
              ...item,
              children: addToColumn(item.children)
            }
          }
          return item
        })
      }
      
      setSections(addToColumn(sections))
      setSelectedSection(newWidget.id)
    }
    
    setDraggedWidget(null)
    setDropTarget(null)
  }

  const handleSave = () => {
    const content = {
      sections: sections
    }
    onSave(content)
  }

  // Stil helper - inline styles için
  const getPreviewStyles = (section: Section): React.CSSProperties => {
    const styles: React.CSSProperties = {}
    
    // Gradient kullanımı kontrolü
    if (section.style?.useGradient && section.style?.gradientFrom && section.style?.gradientTo) {
      const direction = section.style?.gradientDirection || 'to-br'
      const directionMap: Record<string, string> = {
        'to-r': 'to right',
        'to-l': 'to left',
        'to-t': 'to top',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-bl': 'to bottom left',
        'to-tr': 'to top right',
        'to-tl': 'to top left',
      }
      styles.background = `linear-gradient(${directionMap[direction]}, ${section.style.gradientFrom}, ${section.style.gradientTo})`
    } else if (section.style?.backgroundColor) {
      styles.backgroundColor = section.style.backgroundColor
    }
    
    if (section.style?.textColor) styles.color = section.style.textColor
    return styles
  }

  const renderSectionPreview = (section: Section) => {
    switch (section.type) {
      case "container":
        return (
          <div 
            className={`bg-blue-50 p-4 rounded-lg border-2 border-dashed ${
              dropTarget === section.id ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
            }`}
            onDragOver={(e) => handleContainerDragOver(e, section.id)}
            onDragLeave={handleContainerDragLeave}
            onDrop={(e) => handleContainerDrop(e, section.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                📦 Container {section.title && `- ${section.title}`}
              </h3>
              <span className="text-xs text-gray-500">
                {section.children?.length || 0} widget
              </span>
            </div>
            
            {section.children && section.children.length > 0 ? (
              <div className="space-y-2">
                {section.children.map((child) => (
                  <div key={child.id} className="bg-white p-3 rounded border">
                    {renderSectionPreview(child)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                👆 Soldan widget sürükleyin
              </div>
            )}
          </div>
        )
      case "columns":
        const colCount = section.columns?.length || 2
        const gridCols = colCount === 2 ? "md:grid-cols-2" : colCount === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
        const previewGradients = [
          { border: "border-violet-300", bg: "from-violet-50 to-purple-50" },
          { border: "border-cyan-300", bg: "from-cyan-50 to-blue-50" },
          { border: "border-rose-300", bg: "from-rose-50 to-pink-50" },
          { border: "border-amber-300", bg: "from-amber-50 to-orange-50" }
        ]
        return (
          <div className="bg-white p-6 rounded-lg border">
            {section.title && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {section.title}
                </h2>
                {section.description && <p className="text-gray-600 mt-2">{section.description}</p>}
              </div>
            )}
            <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
              {section.columns?.map((col, index) => {
                const gradient = previewGradients[index % previewGradients.length]
                return (
                <div 
                  key={col.id} 
                  className={`space-y-3 bg-gradient-to-br ${gradient.bg} p-4 rounded-xl border-2 ${
                    dropTarget === col.id ? 'border-blue-500 bg-blue-100' : `${gradient.border} border-dashed`
                  } transition-all hover:shadow-md`}
                  onDragOver={(e) => handleColumnDragOver(e, col.id)}
                  onDragLeave={handleContainerDragLeave}
                  onDrop={(e) => handleColumnDrop(e, section.id, col.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Kolon {index + 1}</span>
                  </div>
                  
                  {/* Kolon içeriği (metin/resim) */}
                  {col.imageUrl && (
                    <div className="bg-gray-200 h-32 rounded-lg overflow-hidden">
                      <img src={col.imageUrl} alt={col.title || "Kolon resmi"} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {col.title && <h3 className="text-lg font-semibold">{col.title}</h3>}
                  {col.description && <p className="text-gray-600 text-sm">{col.description}</p>}
                  {col.content && <p className="text-gray-700 text-sm">{col.content}</p>}
                  
                  {/* Kolon içindeki widget'lar */}
                  {col.children && col.children.length > 0 && (
                    <div className="space-y-2">
                      {col.children.map((child) => (
                        <div 
                          key={child.id} 
                          className={`bg-white p-2 rounded border shadow-sm cursor-pointer transition-all hover:border-blue-400 ${
                            selectedSection === child.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSection(child.id)
                          }}
                          onDragOver={(e) => {
                            e.stopPropagation()
                          }}
                          onDrop={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {child.type}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSection(child.id)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          {renderSectionPreview(child)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Boş kolon mesajı */}
                  {!col.imageUrl && !col.title && !col.content && (!col.children || col.children.length === 0) && (
                    <div className="text-gray-400 text-center py-12 border-2 border-dashed border-gray-300 rounded bg-white/50">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs font-medium">Soldan widget sürükleyin</span>
                      </div>
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        )
      case "hero":
        return (
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg" 
            style={getPreviewStyles(section)}
          >
            <h1 className="text-4xl font-bold mb-4">{section.title || "Başlık"}</h1>
            <h2 className="text-xl mb-4">{section.subtitle || "Alt başlık"}</h2>
            <p className="text-lg">{section.description || "Açıklama"}</p>
          </div>
        )
      case "features-box":
        return (
          <div className="bg-white p-6 rounded-lg border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Sol Taraf - Yazı ve Buton */}
              <div>
                <h2 className="text-3xl font-bold mb-4">{section.title || "Hızlı ve Ölçeklenebilir Çözümler"}</h2>
                <p className="text-gray-600 mb-6">{section.description || "İhtiyaçlarınıza özel tasarlanmış yazılımlarla iş süreçlerinizi optimize edin."}</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                  {section.buttonText || "Destek Ekibimize Ulaşın"}
                </button>
              </div>
              {/* Sağ Taraf - 4 Kutu (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-4">
                {section.items?.slice(0, 4).map((item, index) => (
                  <div key={`${section.id}-item-${index}`} className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-3">
                      {item.icon === "Zap" && "⚡"}
                      {item.icon === "Shield" && "🛡️"}
                      {item.icon === "Star" && "⭐"}
                      {item.icon === "Target" && "🎯"}
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case "service-cards":
        return (
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-center text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {section.title || "Hizmet Portföyümüz"}
            </h2>
            {section.description && (
              <p className="text-center text-gray-600 mb-8">{section.description}</p>
            )}
            <div className="grid grid-cols-3 gap-4">
              {section.items?.slice(0, 6).map((item, index) => (
                <div key={`${section.id}-item-${index}`} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-300">
                  <div className="text-2xl mb-3">
                    {item.icon === "Code" && "💻"}
                    {item.icon === "ShoppingCart" && "🛒"}
                    {item.icon === "Smartphone" && "📱"}
                    {item.icon === "Palette" && "🎨"}
                    {item.icon === "TrendingUp" && "📈"}
                    {item.icon === "PenTool" && "✏️"}
                  </div>
                  <h3 className="font-bold mb-2 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                  <div className="text-xs text-blue-600 font-semibold">Detaylı Bilgi →</div>
                </div>
              ))}
            </div>
          </div>
        )
      case "features":
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Özellikler"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.items?.map((item, index) => (
                <div key={`${section.id}-item-${index}`} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              )) || (
                <div className="text-gray-500">Özellik ekleyin</div>
              )}
            </div>
          </div>
        )
      case "content":
        return (
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border-2 border-violet-200" style={getPreviewStyles(section)}>
            {section.title && (
              <div className="mb-4">
                <div className="h-1 w-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mb-3"></div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {section.title}
                </h2>
              </div>
            )}
            <p className="text-lg text-gray-700 leading-relaxed">{section.content || "İçerik metni buraya gelecek..."}</p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl"></div>
          </div>
        )
      case "stats":
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{section.title || "İstatistikler"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.items?.map((item, index) => (
                <div key={`${section.id}-stat-${index}`} className="text-center bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-blue-600">{item.value || "0"}</div>
                  <div className="text-gray-600 mt-2">{item.label || "İstatistik"}</div>
                </div>
              )) || (
                <div className="text-gray-500">İstatistik ekleyin</div>
              )}
            </div>
          </div>
        )
      
      case "faq":
        return (
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Sıkça Sorulan Sorular"}</h2>
            <div className="space-y-3">
              {section.items?.map((item, index) => (
                <div key={`${section.id}-faq-${index}`} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-lg mb-2">❓ {item.question || item.title || "Soru"}</div>
                  <div className="text-gray-600 text-sm">{item.answer || item.description || "Cevap"}</div>
                </div>
              )) || (
                <div className="text-gray-500 text-center py-8">FAQ öğesi ekleyin</div>
              )}
            </div>
          </div>
        )
      
      case "slider":
        return (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Slider"}</h2>
            <div className="relative bg-gray-300 h-64 rounded-lg flex items-center justify-center overflow-hidden">
              {section.items && section.items.length > 0 ? (
                <img 
                  src={section.items[0].imageUrl || "/placeholder.svg"} 
                  alt={section.items[0].title || "Slide"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500">Slider resmi ekleyin</div>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {section.items?.map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                ))}
              </div>
            </div>
          </div>
        )
      case "image":
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Resim"}</h2>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center overflow-hidden">
              {section.imageUrl ? (
                <img src={section.imageUrl} alt={section.title || "Resim"} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500">Resim URL'si ekleyin</div>
              )}
            </div>
            {section.description && (
              <p className="text-gray-600 mt-4">{section.description}</p>
            )}
          </div>
        )
      case "marquee":
        const animationSpeed = section.animationSpeed || 20 // Varsayılan 20 saniye
        return (
          <div className="bg-blue-600 text-white p-4 rounded-lg overflow-hidden">
            <div 
              className="whitespace-nowrap"
              style={{
                animation: `marquee ${animationSpeed}s linear infinite`,
                display: 'inline-block'
              }}
            >
              <span className="text-2xl font-bold">{section.content || "Kayan yazı metni"}</span>
            </div>
          </div>
        )
      case "gallery":
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Galeri"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.items && section.items.length > 0 ? (
                section.items.map((item, index) => (
                  <div key={`${section.id}-gallery-${index}`} className="bg-gray-200 h-32 rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl || "/placeholder.svg"} 
                      alt={item.title || "Galeri resmi"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 col-span-4">Galeri resimleri ekleyin</div>
              )}
            </div>
          </div>
        )
      case "video":
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">{section.title || "Video"}</h2>
            <div className="bg-gray-900 h-64 rounded-lg flex items-center justify-center">
              {section.videoUrl ? (
                <iframe 
                  src={section.videoUrl} 
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-white">Video URL'si ekleyin (YouTube embed)</div>
              )}
            </div>
            {section.description && (
              <p className="text-gray-600 mt-4">{section.description}</p>
            )}
          </div>
        )
      case "cta":
        return (
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-8 rounded-lg text-center" 
            style={getPreviewStyles(section)}
          >
            <h2 className="text-3xl font-bold mb-4">{section.title || "Harekete Geçirin"}</h2>
            {section.description && (
              <p className="text-lg mb-6">{section.description}</p>
            )}
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
              {section.buttonText || "Tıklayın"}
            </button>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Önizleme mevcut değil</p>
          </div>
        )
    }
  }

  // Recursive olarak seçili section'ı bul
  const findSection = (items: Section[], id: string | null): Section | undefined => {
    if (!id) return undefined
    
    for (const item of items) {
      if (item.id === id) return item
      // Children içinde ara
      if (item.children) {
        const found = findSection(item.children, id)
        if (found) return found
      }
      // Columns içindeki children'larda ara
      if (item.columns) {
        for (const col of item.columns) {
          if (col.children) {
            const found = findSection(col.children, id)
            if (found) return found
          }
        }
      }
    }
    return undefined
  }
  
  const selectedSectionData = findSection(sections, selectedSection)

  return (
    <div className="h-screen flex">
      {/* Sol Sidebar - Widget'lar */}
      <div className="w-80 bg-gray-50 border-r p-4 pb-20 overflow-y-auto h-screen">
        <h3 className="font-semibold mb-4">Widget'lar</h3>
        <div className="space-y-2">
          {WIDGET_TYPES.map((widget) => {
            const Icon = widget.icon
            return (
              <div
                key={widget.type}
                draggable
                onDragStart={() => handleWidgetDragStart(widget.type)}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => addSection(widget.type)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{widget.label}</div>
                    <div className="text-xs text-gray-500">{widget.description}</div>
                  </div>
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Orta Alan - Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={isPreview ? "default" : "outline"}
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Düzenle" : "Önizleme"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {sections.length} bölüm
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isPreview ? (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={section.id}>
                  {renderSectionPreview(section)}
                </div>
              ))}
              {sections.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Henüz bölüm eklenmemiş</p>
                  <p className="text-sm">Sol taraftan widget ekleyin</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <Card 
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-all ${
                    selectedSection === section.id ? 'ring-2 ring-blue-500' : ''
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {section.type === 'container' && '📦 Container'}
                        {section.type === 'columns' && '📊 Kolonlar'}
                        {section.type === 'hero' && 'Hero Section'}
                        {section.type === 'features' && 'Özellikler'}
                        {section.type === 'content' && 'İçerik'}
                        {section.type === 'stats' && 'İstatistikler'}
                        {section.type === 'slider' && 'Slider'}
                        {section.type === 'image' && 'Resim'}
                        {section.type === 'marquee' && 'Kayan Yazı'}
                        {section.type === 'gallery' && 'Galeri'}
                        {section.type === 'video' && 'Video'}
                        {section.type === 'cta' && 'CTA Button'}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Move className="w-4 h-4 text-gray-400" title="Sürükle & Bırak" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(section.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderSectionPreview(section)}
                  </CardContent>
                </Card>
              ))}
              {sections.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Henüz bölüm eklenmemiş</p>
                  <p className="text-sm">Sol taraftan widget ekleyin</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Sidebar - Özellikler */}
      {selectedSectionData && !isPreview && (
        <div className="w-80 bg-gray-50 border-l p-4 pb-20 overflow-y-auto h-screen">
          <h3 className="font-semibold mb-4">Özellikler</h3>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">İçerik</TabsTrigger>
              <TabsTrigger value="style">Stil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={selectedSectionData.title || ""}
                  onChange={(e) => updateSection(selectedSectionData.id, { title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  value={selectedSectionData.subtitle || ""}
                  onChange={(e) => updateSection(selectedSectionData.id, { subtitle: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={selectedSectionData.description || ""}
                  onChange={(e) => updateSection(selectedSectionData.id, { description: e.target.value })}
                />
              </div>

              {selectedSectionData.type === "content" && (
                <div>
                  <Label htmlFor="content">İçerik</Label>
                  <Textarea
                    id="content"
                    value={selectedSectionData.content || ""}
                    onChange={(e) => updateSection(selectedSectionData.id, { content: e.target.value })}
                    rows={6}
                  />
                </div>
              )}

              {selectedSectionData.type === "container" && (
                <div>
                  <Label>Container İçeriği</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Soldan widget sürükleyerek ekleyin
                  </p>
                  <div className="space-y-2">
                    {selectedSectionData.children && selectedSectionData.children.length > 0 ? (
                      selectedSectionData.children.map((child, index) => (
                        <div key={child.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">
                            {index + 1}. {child.type}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSection(child.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Henüz widget eklenmedi
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSectionData.type === "columns" && (
                <div>
                  <Label>Kolonlar</Label>
                  <div className="space-y-4">
                    {selectedSectionData.columns?.map((col, index) => (
                      <Card key={col.id} className="p-3">
                        <h4 className="text-sm font-semibold mb-2">Kolon {index + 1}</h4>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Başlık</Label>
                            <Input
                              placeholder="Kolon başlığı"
                              value={col.title || ""}
                              onChange={(e) => {
                                const newColumns = [...(selectedSectionData.columns || [])]
                                newColumns[index] = { ...col, title: e.target.value }
                                updateSection(selectedSectionData.id, { columns: newColumns })
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">İçerik</Label>
                            <Textarea
                              placeholder="Kolon içeriği"
                              value={col.content || ""}
                              onChange={(e) => {
                                const newColumns = [...(selectedSectionData.columns || [])]
                                newColumns[index] = { ...col, content: e.target.value }
                                updateSection(selectedSectionData.id, { columns: newColumns })
                              }}
                              rows={3}
                            />
                          </div>
                          <ImageUpload
                            label="Resim"
                            value={col.imageUrl}
                            onChange={(url) => {
                              const newColumns = [...(selectedSectionData.columns || [])]
                              newColumns[index] = { ...col, imageUrl: url }
                              updateSection(selectedSectionData.id, { columns: newColumns })
                            }}
                          />
                          
                          {/* Kolon içindeki widget'lar */}
                          {col.children && col.children.length > 0 && (
                            <div className="mt-4">
                              <Label className="text-xs mb-2 block">İçindeki Widget'lar</Label>
                              <div className="space-y-1">
                                {col.children.map((child, childIndex) => (
                                  <div key={child.id} className="flex items-center justify-between bg-gray-100 p-2 rounded text-xs">
                                    <span>{childIndex + 1}. {child.type}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteSection(child.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const newColumns = selectedSectionData.columns?.filter((_, i) => i !== index)
                              updateSection(selectedSectionData.id, { columns: newColumns })
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Kolonu Sil
                          </Button>
                        </div>
                      </Card>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newCol = { id: `col-${Date.now()}`, width: "half", content: "", title: "", imageUrl: "", description: "", children: [] }
                        const newColumns = [...(selectedSectionData.columns || []), newCol]
                        updateSection(selectedSectionData.id, { columns: newColumns })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Kolon Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "features" && (
                <div>
                  <Label>Özellikler</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-feature-${index}`} className="border p-2 rounded space-y-2">
                        <div>
                          <Label className="text-xs">Icon</Label>
                          <select
                            value={item.icon || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, icon: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Icon Seç</option>
                            <option value="code">💻 Code</option>
                            <option value="globe">🌐 Globe</option>
                            <option value="credit-card">💳 Credit Card</option>
                            <option value="zap">⚡ Zap</option>
                            <option value="smartphone">📱 Smartphone</option>
                            <option value="shopping-cart">🛒 Shopping Cart</option>
                            <option value="search">🔍 Search</option>
                            <option value="bar-chart">📊 Bar Chart</option>
                            <option value="trending-up">📈 Trending Up</option>
                            <option value="pie-chart">🥧 Pie Chart</option>
                            <option value="line-chart">📉 Line Chart</option>
                            <option value="activity">📊 Activity</option>
                            <option value="target">🎯 Target</option>
                            <option value="award">🏆 Award</option>
                            <option value="shield">🛡️ Shield</option>
                            <option value="lock">🔒 Lock</option>
                            <option value="check-circle">✅ Check Circle</option>
                            <option value="star">⭐ Star</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="users">👥 Users</option>
                            <option value="settings">⚙️ Settings</option>
                            <option value="package">📦 Package</option>
                            <option value="truck">🚚 Truck</option>
                            <option value="clock">⏰ Clock</option>
                            <option value="mail">📧 Mail</option>
                            <option value="phone">📞 Phone</option>
                            <option value="map-pin">📍 Map Pin</option>
                          </select>
                        </div>
                        <Input
                          placeholder="Özellik başlığı"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                        />
                        <Input
                          placeholder="Açıklama"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, description: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSectionData.items?.filter((_, i) => i !== index) || []
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newItems = [...(selectedSectionData.items || []), { title: "", description: "", icon: "" }]
                        updateSection(selectedSectionData.id, { items: newItems })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Özellik Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "stats" && (
                <div>
                  <Label>İstatistikler</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-stat-${index}`} className="border p-2 rounded space-y-2">
                        <div>
                          <Label className="text-xs">Icon (Opsiyonel)</Label>
                          <select
                            value={item.icon || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, icon: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Icon Yok</option>
                            <option value="trending-up">📈 Trending Up</option>
                            <option value="bar-chart">📊 Bar Chart</option>
                            <option value="activity">📊 Activity</option>
                            <option value="target">🎯 Target</option>
                            <option value="award">🏆 Award</option>
                            <option value="star">⭐ Star</option>
                            <option value="users">👥 Users</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="zap">⚡ Zap</option>
                            <option value="check-circle">✅ Check Circle</option>
                            <option value="globe">🌐 Globe</option>
                            <option value="shopping-cart">🛒 Shopping Cart</option>
                            <option value="package">📦 Package</option>
                            <option value="truck">🚚 Truck</option>
                          </select>
                        </div>
                        <Input
                          placeholder="Değer (örn: 1000+)"
                          value={item.value || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, value: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                        />
                        <Input
                          placeholder="Etiket (örn: Mutlu Müşteri)"
                          value={item.label || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, label: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSectionData.items?.filter((_, i) => i !== index) || []
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newItems = [...(selectedSectionData.items || []), { value: "0", label: "İstatistik", icon: "" }]
                        updateSection(selectedSectionData.id, { items: newItems })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      İstatistik Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "features-box" && (
                <div>
                  <div className="mb-4 space-y-2">
                    <div>
                      <Label htmlFor="buttonText">Buton Metni</Label>
                      <Input
                        id="buttonText"
                        value={selectedSectionData.buttonText || ""}
                        onChange={(e) => updateSection(selectedSectionData.id, { buttonText: e.target.value })}
                        placeholder="Destek Ekibimize Ulaşın"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonUrl">Buton URL</Label>
                      <Input
                        id="buttonUrl"
                        value={selectedSectionData.buttonUrl || ""}
                        onChange={(e) => updateSection(selectedSectionData.id, { buttonUrl: e.target.value })}
                        placeholder="/iletisim"
                      />
                    </div>
                  </div>
                  
                  <Label>Özellik Kutuları (4 Adet)</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-fbox-${index}`} className="border-2 border-blue-200 bg-blue-50 p-3 rounded-lg space-y-2">
                        <div className="font-semibold text-sm text-blue-900">Kutu {index + 1}</div>
                        <div>
                          <Label className="text-xs">Icon</Label>
                          <select
                            value={item.icon || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, icon: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            className="w-full border rounded px-2 py-1 text-sm bg-white"
                          >
                            <option value="">Icon Seç</option>
                            <option value="Zap">⚡ Zap</option>
                            <option value="Shield">🛡️ Shield</option>
                            <option value="Star">⭐ Star</option>
                            <option value="Target">🎯 Target</option>
                            <option value="Code">💻 Code</option>
                            <option value="Smartphone">📱 Smartphone</option>
                            <option value="Globe">🌐 Globe</option>
                            <option value="Heart">❤️ Heart</option>
                          </select>
                        </div>
                        <Input
                          placeholder="Başlık"
                          value={item.title || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="bg-white"
                        />
                        <Textarea
                          placeholder="Açıklama"
                          value={item.description || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, description: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          rows={2}
                          className="bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSectionData.type === "service-cards" && (
                <div>
                  <Label>Hizmet Kartları (6 Adet)</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-scard-${index}`} className="border-2 border-purple-200 bg-purple-50 p-3 rounded-lg space-y-2">
                        <div className="font-semibold text-sm text-purple-900">Kart {index + 1}</div>
                        <div>
                          <Label className="text-xs">Icon</Label>
                          <select
                            value={item.icon || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, icon: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            className="w-full border rounded px-2 py-1 text-sm bg-white"
                          >
                            <option value="">Icon Seç</option>
                            <option value="Code">💻 Code</option>
                            <option value="ShoppingCart">🛒 Shopping Cart</option>
                            <option value="Smartphone">📱 Smartphone</option>
                            <option value="Palette">🎨 Palette</option>
                            <option value="TrendingUp">📈 Trending Up</option>
                            <option value="PenTool">✏️ Pen Tool</option>
                          </select>
                        </div>
                        <Input
                          placeholder="Hizmet Adı"
                          value={item.title || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="bg-white"
                        />
                        <Textarea
                          placeholder="Açıklama"
                          value={item.description || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, description: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          rows={2}
                          className="bg-white"
                        />
                        <Input
                          placeholder="URL (örn: /web-tasarim)"
                          value={item.url || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, url: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSectionData.type === "faq" && (
                <div>
                  <Label>SSS / FAQ Öğeleri</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-faq-${index}`} className="border p-3 rounded space-y-2 bg-gray-50">
                        <div>
                          <Label className="text-xs font-semibold">Soru</Label>
                          <Textarea
                            placeholder="Soru yazın..."
                            value={item.question || item.title || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, question: e.target.value, title: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Cevap</Label>
                          <Textarea
                            placeholder="Cevap yazın..."
                            value={item.answer || item.description || ""}
                            onChange={(e) => {
                              const newItems = [...(selectedSectionData.items || [])]
                              newItems[index] = { ...item, answer: e.target.value, description: e.target.value }
                              updateSection(selectedSectionData.id, { items: newItems })
                            }}
                            rows={4}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSectionData.items?.filter((_, i) => i !== index) || []
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newItems = [...(selectedSectionData.items || []), { 
                          question: "Yeni soru?", 
                          answer: "Cevap buraya...",
                          title: "Yeni soru?",
                          description: "Cevap buraya..."
                        }]
                        updateSection(selectedSectionData.id, { items: newItems })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Soru Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "slider" && (
                <div>
                  <Label>Slider Resimleri</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-slide-${index}`} className="border p-2 rounded">
                        <ImageUpload
                          value={item.imageUrl || ""}
                          onChange={(url) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, imageUrl: url }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          label={`Slide ${index + 1}`}
                        />
                        <Input
                          placeholder="Başlık"
                          value={item.title || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="mt-2"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSectionData.items?.filter((_, i) => i !== index) || []
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="mt-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newItems = [...(selectedSectionData.items || []), { imageUrl: "", title: "Slide" }]
                        updateSection(selectedSectionData.id, { items: newItems })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Slide Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "image" && (
                <div>
                  <ImageUpload
                    value={selectedSectionData.imageUrl || ""}
                    onChange={(url) => updateSection(selectedSectionData.id, { imageUrl: url })}
                    label="Resim"
                  />
                </div>
              )}

              {selectedSectionData.type === "marquee" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="marqueeContent">Kayan Yazı Metni</Label>
                    <Textarea
                      id="marqueeContent"
                      value={selectedSectionData.content || ""}
                      onChange={(e) => updateSection(selectedSectionData.id, { content: e.target.value })}
                      placeholder="Kayan yazı metni..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="animationSpeed">
                      Animasyon Hızı (saniye): {selectedSectionData.animationSpeed || 20}s
                    </Label>
                    <input
                      id="animationSpeed"
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={selectedSectionData.animationSpeed || 20}
                      onChange={(e) => updateSection(selectedSectionData.id, { animationSpeed: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5s (Çok Hızlı)</span>
                      <span>30s (Normal)</span>
                      <span>60s (Yavaş)</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "gallery" && (
                <div>
                  <Label>Galeri Resimleri</Label>
                  <div className="space-y-2">
                    {selectedSectionData.items?.map((item, index) => (
                      <div key={`${selectedSectionData.id}-gallery-${index}`} className="border p-2 rounded">
                        <ImageUpload
                          value={item.imageUrl || ""}
                          onChange={(url) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, imageUrl: url }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          label={`Resim ${index + 1}`}
                        />
                        <Input
                          placeholder="Başlık (opsiyonel)"
                          value={item.title || ""}
                          onChange={(e) => {
                            const newItems = [...(selectedSectionData.items || [])]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="mt-2"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newItems = selectedSectionData.items?.filter((_, i) => i !== index) || []
                            updateSection(selectedSectionData.id, { items: newItems })
                          }}
                          className="mt-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Sil
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newItems = [...(selectedSectionData.items || []), { imageUrl: "", title: "" }]
                        updateSection(selectedSectionData.id, { items: newItems })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Resim Ekle
                    </Button>
                  </div>
                </div>
              )}

              {selectedSectionData.type === "video" && (
                <div>
                  <Label htmlFor="videoUrl">Video URL (YouTube Embed)</Label>
                  <Input
                    id="videoUrl"
                    value={selectedSectionData.videoUrl || ""}
                    onChange={(e) => updateSection(selectedSectionData.id, { videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube video'su için: Video'yu aç → Paylaş → Yerleştir → URL'i kopyala
                  </p>
                </div>
              )}

              {selectedSectionData.type === "cta" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="buttonText">Buton Metni</Label>
                    <Input
                      id="buttonText"
                      value={selectedSectionData.buttonText || ""}
                      onChange={(e) => updateSection(selectedSectionData.id, { buttonText: e.target.value })}
                      placeholder="Hemen Başla"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonUrl">Buton URL</Label>
                    <Input
                      id="buttonUrl"
                      value={selectedSectionData.buttonUrl || ""}
                      onChange={(e) => updateSection(selectedSectionData.id, { buttonUrl: e.target.value })}
                      placeholder="/iletisim"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="style" className="space-y-4">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useGradient" className="text-sm font-semibold">🎨 Gradient Kullan</Label>
                  <input
                    id="useGradient"
                    type="checkbox"
                    checked={selectedSectionData.style?.useGradient || false}
                    onChange={(e) => updateSection(selectedSectionData.id, { 
                      style: { ...selectedSectionData.style, useGradient: e.target.checked }
                    })}
                    className="h-4 w-4"
                  />
                </div>

                {selectedSectionData.style?.useGradient ? (
                  <>
                    <div>
                      <Label htmlFor="gradientFrom">Gradient Başlangıç Rengi</Label>
                      <Input
                        id="gradientFrom"
                        type="color"
                        value={selectedSectionData.style?.gradientFrom || "#3b82f6"}
                        onChange={(e) => updateSection(selectedSectionData.id, { 
                          style: { ...selectedSectionData.style, gradientFrom: e.target.value }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gradientTo">Gradient Bitiş Rengi</Label>
                      <Input
                        id="gradientTo"
                        type="color"
                        value={selectedSectionData.style?.gradientTo || "#8b5cf6"}
                        onChange={(e) => updateSection(selectedSectionData.id, { 
                          style: { ...selectedSectionData.style, gradientTo: e.target.value }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gradientDirection">Gradient Yönü</Label>
                      <select
                        id="gradientDirection"
                        className="w-full border rounded px-3 py-2"
                        value={selectedSectionData.style?.gradientDirection || "to-br"}
                        onChange={(e) => updateSection(selectedSectionData.id, { 
                          style: { ...selectedSectionData.style, gradientDirection: e.target.value }
                        })}
                      >
                        <option value="to-r">Sağa →</option>
                        <option value="to-l">Sola ←</option>
                        <option value="to-t">Yukarı ↑</option>
                        <option value="to-b">Aşağı ↓</option>
                        <option value="to-br">Sağ Alt ↘</option>
                        <option value="to-bl">Sol Alt ↙</option>
                        <option value="to-tr">Sağ Üst ↗</option>
                        <option value="to-tl">Sol Üst ↖</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label htmlFor="bgColor">Arkaplan Rengi</Label>
                    <Input
                      id="bgColor"
                      type="color"
                      value={selectedSectionData.style?.backgroundColor || "#ffffff"}
                      onChange={(e) => updateSection(selectedSectionData.id, { 
                        style: { ...selectedSectionData.style, backgroundColor: e.target.value }
                      })}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="textColor">Metin Rengi</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={selectedSectionData.style?.textColor || "#000000"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, textColor: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="padding">İç Boşluk</Label>
                <select
                  id="padding"
                  className="w-full border rounded px-3 py-2"
                  value={selectedSectionData.style?.padding || "normal"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, padding: e.target.value }
                  })}
                >
                  <option value="none">Yok</option>
                  <option value="small">Küçük</option>
                  <option value="normal">Normal</option>
                  <option value="large">Büyük</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="marginTop">Üst Boşluk</Label>
                <select
                  id="marginTop"
                  className="w-full border rounded px-3 py-2"
                  value={selectedSectionData.style?.marginTop || "normal"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, marginTop: e.target.value }
                  })}
                >
                  <option value="none">Yok</option>
                  <option value="small">Küçük</option>
                  <option value="normal">Normal</option>
                  <option value="large">Büyük</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="marginBottom">Alt Boşluk</Label>
                <select
                  id="marginBottom"
                  className="w-full border rounded px-3 py-2"
                  value={selectedSectionData.style?.marginBottom || "normal"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, marginBottom: e.target.value }
                  })}
                >
                  <option value="none">Yok</option>
                  <option value="small">Küçük</option>
                  <option value="normal">Normal</option>
                  <option value="large">Büyük</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="borderRadius">Köşe Yuvarlaklığı</Label>
                <select
                  id="borderRadius"
                  className="w-full border rounded px-3 py-2"
                  value={selectedSectionData.style?.borderRadius || "normal"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, borderRadius: e.target.value }
                  })}
                >
                  <option value="none">Yok</option>
                  <option value="small">Küçük</option>
                  <option value="normal">Normal</option>
                  <option value="large">Büyük</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="alignment">Hizalama</Label>
                <select
                  id="alignment"
                  className="w-full border rounded px-3 py-2"
                  value={selectedSectionData.style?.alignment || "center"}
                  onChange={(e) => updateSection(selectedSectionData.id, { 
                    style: { ...selectedSectionData.style, alignment: e.target.value }
                  })}
                >
                  <option value="left">Sol</option>
                  <option value="center">Ortala</option>
                  <option value="right">Sağ</option>
                </select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
