# Las recetas de la abuela · por Chef Alba 🍽️

Web personal con 383 recetas familiares, valoradas y comentadas por Chef Alba.

## 📂 Estructura

```
web/
├── index.html           ← Página principal
├── css/
│   └── styles.css       ← Estilos pastel suaves
├── js/
│   ├── app.js           ← Lógica principal
│   ├── i18n.js          ← Traducciones ES/EN
│   └── firebase.js      ← Votos compartidos
├── data/
│   └── recetas.json     ← Las 383 recetas
└── img/
    └── recetas/         ← Fotos de las recetas favoritas
```

## 🚀 Cómo subir a GitHub Pages

1. **Crear un repositorio nuevo en GitHub** (ej: `recetas-chef-alba`)
2. **Subir todo el contenido** de la carpeta `web/` a la raíz del repositorio
3. **Activar GitHub Pages:**
   - Settings → Pages
   - Source: `main` branch, root folder
   - Guardar
4. **¡Listo!** La web estará en `https://[tu-usuario].github.io/recetas-chef-alba/`

## 🔥 Firebase (votos compartidos)

Ya está configurado para usar la base de datos:
`https://las-recetas-de-alba-default-rtdb.europe-west1.firebasedatabase.app/`

Los votos se guardan en `/votos/[slug-de-la-receta]/` automáticamente.

## ✏️ Editar recetas

Para cambiar comentarios o valoraciones de Chef Alba:
1. Editar el archivo `data/recetas.json`
2. Subir el cambio a GitHub
3. La web se actualiza sola

## 📸 Añadir fotos

Para añadir más fotos:
1. Copiar el archivo PNG a `img/recetas/`
2. En `data/recetas.json`, encontrar la receta y poner el nombre del archivo en `imagen_local`
3. Subir a GitHub

Las recetas sin foto local usan **Unsplash** automáticamente (búsqueda por nombre).

## 🌍 Idiomas

Web disponible en español (ES) e inglés (EN). El cambio es instantáneo desde el botón arriba a la derecha.

## 📱 Responsive

Diseñada para verse perfectamente en:
- 📱 Móvil
- 📱 iPad / Tablet
- 💻 Ordenador / PC

---

Hecho con cariño para Chef Alba 👩‍🍳
