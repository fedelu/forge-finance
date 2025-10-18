# 🚀 Deploy a Vercel - Pasos Detallados

## 📋 **Paso a Paso para Deploy en Vercel**

### **1. Preparar el Repositorio en GitHub**

Si no tienes el código en GitHub aún:

```bash
# 1. Inicializar git (si no está inicializado)
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit inicial
git commit -m "Initial commit - Forge Finance ready for Vercel deploy"

# 4. Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/forge-finance.git
git branch -M main
git push -u origin main
```

### **2. Deploy en Vercel (Web Interface)**

#### **Paso 1: Acceder a Vercel**
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** o **"Log In"**
3. Conecta con tu cuenta de **GitHub**

#### **Paso 2: Importar Proyecto**
1. Haz clic en **"New Project"**
2. Selecciona el repositorio **`forge-finance`**
3. Vercel detectará automáticamente que es Next.js

#### **Paso 3: Configuración del Proyecto**
```
Project Name: forge-finance
Framework Preset: Next.js
Root Directory: app
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### **Paso 4: Variables de Entorno**
Vercel configurará automáticamente estas variables:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_EXPLORER_URL=https://explorer.solana.com
NEXT_PUBLIC_COMMITMENT=confirmed
```

#### **Paso 5: Deploy**
1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Tu app estará lista!

### **3. Configuración Adicional (Opcional)**

#### **Dominio Personalizado**
1. Ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

#### **Variables de Entorno Personalizadas**
Si necesitas cambiar algo:
1. Ve a **Settings > Environment Variables**
2. Agrega o modifica las variables

### **4. Verificar el Deploy**

Una vez deployado, verifica que todo funciona:

1. **URL de la app**: `https://forge-finance-xxx.vercel.app`
2. **Conectar wallet**: Debe funcionar con Phantom/Solflare
3. **Navegación**: Todas las pestañas deben funcionar
4. **Depósitos**: Deben actualizar balances y analytics

### **5. URLs Importantes para Usuarios**

Después del deploy, comparte estas URLs:

```
🌐 Tu App: https://forge-finance-xxx.vercel.app
💰 Faucet: https://faucet.solana.com (seleccionar devnet)
🔍 Explorer: https://explorer.solana.com/?cluster=devnet
📱 Phantom: https://phantom.app
```

### **6. Actualizaciones Automáticas**

Con Vercel conectado a GitHub:
- **Push a main** → Deploy automático
- **Pull requests** → Preview deployments
- **Rollback** fácil desde el dashboard

### **7. Monitoreo**

- **Analytics**: Disponible en Vercel dashboard
- **Logs**: Revisa errores en tiempo real
- **Performance**: Métricas de velocidad

## 🎯 **Resultado Final**

Una vez deployado, tendrás:

✅ **App pública** accesible desde cualquier lugar
✅ **Hosting gratuito** con 100GB bandwidth/mes
✅ **CDN global** para velocidad mundial
✅ **SSL automático** (HTTPS)
✅ **Deploy automático** con cada push
✅ **Dominio personalizado** opcional

## 🚀 **¡Listo para que otros prueben tu Forge Finance!**

Los usuarios podrán:
- Conectar wallets
- Obtener SOL gratis del faucet
- Hacer depósitos y retiros
- Crear crucibles
- Votar en propuestas
- Ver analytics en tiempo real
- Ganar SPARK y HEAT tokens

---

**💡 Tip**: Si tienes problemas, revisa los logs en Vercel dashboard o contacta el soporte de Vercel.
