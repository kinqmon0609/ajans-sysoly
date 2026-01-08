#!/bin/bash

# Merge conflict marker'larını otomatik temizle
# Sadece "theirs" versiyonunu (e25526c commit'i) kullan

files=(
  "app/paketlerimiz/page.tsx"
  "app/api/pages/route.ts"
  "app/[slug]/page.tsx"
  "components/header.tsx"
  "lib/mysql/queries.ts"
  "lib/mysql/client.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Temizleniyor: $file"
    
    # Conflict marker'ları temizle - theirs versiyonunu kullan
    sed -i.bak '/^<<<<<<< HEAD$/,/^=======$/d' "$file"
    sed -i.bak '/^>>>>>>> e25526c$/d' "$file"
    
    # Backup dosyasını sil
    rm -f "$file.bak"
    
    echo "✅ Temizlendi: $file"
  fi
done

echo "🎉 Tüm conflict'ler temizlendi!"
