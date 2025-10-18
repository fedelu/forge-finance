# 🔐 GitHub Authentication Setup

## 📋 **Configurar Autenticación para GitHub**

### **Opción 1: Personal Access Token (Recomendado)**

1. **Crear Personal Access Token:**
   - Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Clic en "Generate new token (classic)"
   - Selecciona scopes: `repo`, `workflow`, `write:packages`
   - Copia el token generado

2. **Usar el token:**
   ```bash
   # Cuando Git pida username y password:
   # Username: fedelu
   # Password: [pega tu personal access token aquí]
   ```

### **Opción 2: GitHub CLI (Más Fácil)**

1. **Instalar GitHub CLI:**
   ```bash
   # macOS
   brew install gh
   
   # O descarga desde: https://cli.github.com/
   ```

2. **Autenticar:**
   ```bash
   gh auth login
   # Selecciona: GitHub.com > HTTPS > Yes > Login with web browser
   ```

3. **Push:**
   ```bash
   git push -u origin main
   ```

### **Opción 3: SSH Key (Más Seguro)**

1. **Generar SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "tu-email@example.com"
   ```

2. **Agregar a GitHub:**
   - Copia la clave pública: `cat ~/.ssh/id_ed25519.pub`
   - Ve a [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
   - Clic en "New SSH key"
   - Pega la clave pública

3. **Cambiar remote a SSH:**
   ```bash
   git remote set-url origin git@github.com:fedelu/forge-finance.git
   git push -u origin main
   ```

## 🚀 **Después del Push Exitoso**

### **Verificar en GitHub:**
- Ve a [https://github.com/fedelu/forge-finance](https://github.com/fedelu/forge-finance)
- Deberías ver todos los archivos subidos
- El README.md debe verse bien formateado

### **Deploy en Vercel:**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta con GitHub
3. Importa `forge-finance`
4. Root Directory: `app`
5. ¡Deploy automático!

## 🎯 **Resultado Final**

- **GitHub**: [https://github.com/fedelu/forge-finance](https://github.com/fedelu/forge-finance)
- **Vercel**: `https://forge-finance-xxx.vercel.app`
- **Demo público** para que otros prueben

---

**💡 Tip**: La Opción 2 (GitHub CLI) es la más fácil y rápida.
