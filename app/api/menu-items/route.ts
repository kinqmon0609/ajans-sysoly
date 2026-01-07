import { type NextRequest, NextResponse } from "next/server"

// Menu items - Header component için
const mockMenuItems = [
  { id: '65a650a6-e938-4d8b-ade5-7d65ba2e3476', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '2dbb3d1c-a6d9-11f0-af23-eb6435dcb1e1', label: 'Hakkımızda', url: null, parent_id: null, display_order: 0, is_active: true, page_slug: 'hakkimizda' },
  { id: '6aaf2452-10c9-4f41-bb06-d19d91fe843e', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '1c6f7298-a6b2-11f0-af23-eb6435dcb1e1', label: 'Hizmetlerimiz', url: null, parent_id: null, display_order: 1, is_active: true, page_slug: 'hizmetlerimiz' },
  { id: '6d2c0f58-bd2e-4ea3-b974-ed1c7c952b82', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: null, label: 'Yazılımlarımız', url: '/demolarimiz', parent_id: null, display_order: 2, is_active: true },
  { id: 'abae90a8-a714-11f0-b978-7df75ef09a30', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '8a388e24-a714-11f0-b978-7df75ef09a30', label: 'Paketlerimiz', url: null, parent_id: null, display_order: 3, is_active: true, page_slug: 'paketlerimiz' },
  { id: '2597b697-ad3a-4a87-b72e-0dc23b7a1f61', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: null, label: 'Blog', url: '/blog', parent_id: null, display_order: 4, is_active: true },
  { id: '52559400-b74b-4253-970a-37820b034e88', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '603431d6-a6d9-11f0-af23-eb6435dcb1e1', label: 'İletişim', url: null, parent_id: null, display_order: 5, is_active: true, page_slug: 'iletisim' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const menuId = searchParams.get("menuId")
    
    // MySQL'den menu items çek
    const { getMenuItems } = await import("@/lib/mysql/queries")
    const menuItems = await getMenuItems(menuId)
    console.log('✅ Menu items loaded from MySQL:', menuItems?.length || 0);
    
    // Eğer MySQL'den veri gelmediyse mock data kullan
    if (!menuItems || menuItems.length === 0) {
      console.log('📝 Using mock menu items data');
      if (menuId) {
        const filteredItems = mockMenuItems.filter(item => item.menu_id === menuId)
        return NextResponse.json(filteredItems)
      }
      return NextResponse.json(mockMenuItems)
    }
    
    if (menuId) {
      const filteredItems = menuItems.filter(item => item.menu_id === menuId)
      return NextResponse.json(filteredItems)
    }
    
    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("❌ Menu items fetch error:", error)
    // Hata durumunda mock data döndür
    const { searchParams } = new URL(request.url)
    const menuId = searchParams.get("menuId")
    
    if (menuId) {
      const filteredItems = mockMenuItems.filter(item => item.menu_id === menuId)
      return NextResponse.json(filteredItems)
    }
    
    return NextResponse.json(mockMenuItems)
  }
}