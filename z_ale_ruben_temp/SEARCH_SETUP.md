# Guía de Instalación - Sistema de Búsqueda

## 📋 Resumen

Implementación completa de búsqueda para e-commerce con:
- Barra de búsqueda persistente en TopBar
- Autocomplete con resultados en tiempo real
- Búsqueda de productos y packs
- Filtros por categoría, precio y tipo
- Página de resultados con sidebars

---

## 🔧 Backend (Laravel)

### 1. Archivos añadidos

#### SearchController
```
cerrajeria-back/app/Http/Controllers/Api/SearchController.php
```

**Métodos:**
- `search(Request $request)` - Búsqueda completa (productos + packs)
- `quickSearch(Request $request)` - Autocomplete rápido (mínimo 2 chars)

#### Migración de índices
```
cerrajeria-back/database/migrations/2026_04_18_140000_add_search_indexes.php
```

**Índices creados:**
- `products`: FULLTEXT en (name, description, sku)
- `packs`: FULLTEXT en (name, description)
- Índices normales para filtros: category_id, is_active, price, etc.

### 2. Pasos de instalación backend

```bash
# Navegar al directorio del backend
cd /home/ruben/LaravelPRJ/cerrajeria-abp/cerrajeria-back

# 1. Ejecutar la migración de índices
php artisan migrate

# 2. Verificar que las rutas están cargadas
php artisan route:list | grep search
```

**Resultado esperado:**
```
GET|HEAD  api/search .................... SearchController@search
GET|HEAD  api/search/quick .............. SearchController@quickSearch
```

### 3. Estructura de respuesta API

**GET /api/search?q=llave&limit=20&category_id=1&price_min=10&price_max=100**

```json
{
  "products": [
    {
      "id": 1,
      "name": "Llave inglesa",
      "price": 12.99,
      "category": {"id": 1, "name": "Herramientas"},
      "images": [{"path": "..."}],
      "description": "..."
    }
  ],
  "packs": [
    {
      "id": 5,
      "name": "Kit de herramientas",
      "total_price": 49.99,
      "products_count": 5,
      "products": [{"id": 1, "name": "..."}],
      "images": [{"path": "..."}]
    }
  ],
  "suggestions": ["llave", "inglesa", "herramienta"],
  "categories": [
    {"id": 1, "name": "Herramientas", "products_count": 15}
  ],
  "total": 23
}
```

---

## 🎨 Frontend (React)

### 1. Archivos añadidos/modificados

#### Nuevos componentes:
```
cerrajeria-front/src/components/SearchBar.jsx
cerrajeria-front/src/components/PackCard.jsx
```

#### Nueva página:
```
cerrajeria-front/src/pages/search/SearchResults.jsx
```

#### API:
```
cerrajeria-front/src/api/search_api.js
```

#### Estilos SCSS:
```
cerrajeria-front/scss/components/_search_bar.scss
cerrajeria-front/scss/pages/_search_results.scss
```

#### Actualizaciones:
- `src/App.jsx` - Añadida ruta `/search`
- `src/components/layout/TopBarShop.jsx` - Integrado SearchBar
- `scss/main_shop.scss` - Importados nuevos estilos

### 2. Pasos de instalación frontend

```bash
# Navegar al directorio frontend
cd /home/ruben/LaravelPRJ/cerrajeria-abp/cerrajeria-front

# Instalar dependencias (si no están)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Configuración environment

En `.env` del frontend, asegurar:
```
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Funcionalidades

### Barra de búsqueda (TopBar)
- **Desktop**: visible desde sm (640px), ancho responsive
- **Mobile**: icono de lupa que redirige a `/search`
- **Autocomplete**: aparece tras 2+ caracteres, muestra hasta 5 resultados
- **UI**: productos y packs separados visualmente

### Página de resultados (`/search`)
**Features:**
- Header con query y contador de resultados
- Sidebar de filtros (desktop) / Modal (mobile):
  - Categorías (conteo de productos)
  - Rango de precio (min/max)
  -checkbox "Solo packs"
  - Sugerencias de búsqueda
- Grid responsive de resultados
- Secciones separadas: Productos / Packs
- Empty states con acciones útiles

### Integración con existing code
- ProductDetailModal reutilizado para productos y packs
- ProductCard existente detecta automáticamente packs (via `total_price`)
- PackCard personalizado (opcional, usa ProductCard internamente)

---

## 🐛 Troubleshooting

### La búsqueda no devuelve resultados
1. Verificar que el backend esté corriendo: `php artisan serve`
2. Verificar migraciones: `php artisan migrate:status`
3. Probar API directamente: `GET http://localhost:8000/api/search?q=test`
4. Revisar logs: `tail -f storage/logs/laravel.log`

### Autocomplete no funciona
1. Verificar que la API esté accesible desde frontend
2. Abrir DevTools → Network, ver peticiones a `/api/search/quick`
3. Verificar React Query Devtools si está instalado

### Estilos no aplican
```bash
# Recompilar SCSS
npm run build  # o npm run dev para hot reload
```

### Índices no funcionan
Si la migración falló:
```bash
php artisan migrate:rollback
php artisan migrate
```
Para grandes volúmenes, considerar usar `DB::statement()` manualmente.

---

## 📊 Performance

**Para ~100 productos:**
- Búsqueda con `LIKE` + índices normales es suficiente
- FULLTEXT index mejora significativamente búsquedas textuales
- React Query cachea resultados 2 min (staleTime)

**Escalabilidad futura:**
- Si >1000 productos → considerar ElasticSearch o Algolia
- Si búsquedas lentas → añadir caché Redis en backend

---

## 🎯 Próximas mejoras (opcionales)

1. **Historial de búsquedas** (localStorage)
2. **Búsqueda por voz** (Web Speech API)
3. **Filtros por características** (features)
4. **Búsqueda por imagen** (CLIP/OpenAI)
5. **Autocomplete con highlight** (markdown en resultados)
6. **Google Analytics integration** (tracking de queries)

---

## ✅ Checklist de verificación

- [ ] Backend: `SearchController` existe
- [ ] Backend: Rutas registradas en `routes/api.php`
- [ ] Backend: Migración ejecutada (`php artisan migrate`)
- [ ] Frontend: Componentes compilados sin errores
- [ ] Frontend: SearchBar visible en TopBar
- [ ] Frontend: Ruta `/search` funciona
- [ ] Búsqueda devuelve productos y packs
- [ ] Filtros aplican correctamente
- [ ] Modal de producto abre desde resultados
- [ ] Mobile responsive funciona

---

## 📞 Soporte

Para incidencias, revisar:
- Backend logs: `storage/logs/laravel.log`
- Frontend console: `F12 → Console`
- Network tab en DevTools
