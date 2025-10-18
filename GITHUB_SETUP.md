# 🚀 GitHub Setup - Forge Finance

## 📋 **Pasos para subir a GitHub**

### **1. Crear Repositorio en GitHub**

1. **Ve a [github.com](https://github.com)**
2. **Haz clic en "New repository"**
3. **Configuración del repositorio:**
   ```
   Repository name: forge-finance
   Description: 🔥 Forge Finance - Solana DeFi Protocol with Crucible Management, Governance & Analytics
   Visibility: Public (para que otros puedan ver el demo)
   Initialize: NO (ya tenemos archivos)
   ```

### **2. Conectar Repositorio Local**

Ejecuta estos comandos en tu terminal:

```bash
# 1. Agregar remote origin (reemplaza TU_USUARIO con tu username de GitHub)
git remote add origin https://github.com/TU_USUARIO/forge-finance.git

# 2. Cambiar a branch main
git branch -M main

# 3. Subir código a GitHub
git push -u origin main
```

### **3. Verificar en GitHub**

1. **Ve a tu repositorio**: `https://github.com/TU_USUARIO/forge-finance`
2. **Verifica que todos los archivos estén ahí**
3. **Revisa el README.md** - debe verse bien formateado

## 🎯 **Después del Push a GitHub**

### **Deploy Automático a Vercel**

1. **Ve a [vercel.com](https://vercel.com)**
2. **Conecta con GitHub**
3. **Importa el proyecto `forge-finance`**
4. **Configuración automática:**
   - Root Directory: `app`
   - Framework: Next.js
   - Build Command: `npm run build`
5. **¡Deploy!**

### **URLs que tendrás:**

- **GitHub**: `https://github.com/TU_USUARIO/forge-finance`
- **Vercel**: `https://forge-finance-xxx.vercel.app`
- **Demo**: Accesible públicamente

## 🔧 **Comandos Útiles**

### **Para futuras actualizaciones:**

```bash
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción del cambio"

# Subir a GitHub
git push origin main
```

### **Para clonar en otra máquina:**

```bash
git clone https://github.com/TU_USUARIO/forge-finance.git
cd forge-finance
cd app
npm install
npm run dev
```

## 📱 **Lo que obtienes**

✅ **Repositorio público** en GitHub
✅ **Deploy automático** en Vercel
✅ **URL pública** para compartir
✅ **Código versionado** con Git
✅ **Colaboración** con otros desarrolladores
✅ **Issues y PRs** para gestión de proyecto

## 🎉 **¡Listo para compartir!**

Una vez en GitHub y Vercel, podrás:

- **Compartir la URL** con otros
- **Mostrar el código** en tu portfolio
- **Recibir contribuciones** de la comunidad
- **Hacer updates** automáticamente
- **Colaborar** con otros desarrolladores

---

**💡 Tip**: Asegúrate de que el repositorio sea público para que Vercel pueda acceder a él.
