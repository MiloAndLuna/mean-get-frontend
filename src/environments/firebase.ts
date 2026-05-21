// ============================================================
// ARCHIVO: src/environments/firebase.ts
// PROPÓSITO: Configuración del proyecto Firebase.
//
// En este proyecto Full Stack, Firebase se usa ÚNICAMENTE para:
//   ✅ Autenticación con Google SSO (Google Sign-In)
//   ❌ NO se usa Firestore (los datos van a MongoDB Atlas)
//   ❌ NO se usa Firebase Storage ni otros servicios
//
// Este objeto se importa en app.config.ts y se pasa a:
//   provideFirebaseApp(() => initializeApp(firebaseConfig))
//   provideAuth(() => getAuth())
// ============================================================

/**
 * firebaseConfig
 * Credenciales del proyecto Firebase:
 * "gestioninteligenteinvent-a0577"
 *
 * Obtenidas desde:
 * Firebase Console → Project Settings → General → Your apps → SDK setup
 *
 * ⚠️  NOTA DE SEGURIDAD:
 *   Estas claves son públicas por diseño (se envían al navegador).
 *   La seguridad real se configura en Firebase Console mediante:
 *   - Authentication → Authorized domains (solo dominios permitidos)
 *   - Firestore/Storage → Rules (si se usaran esos servicios)
 */
// ID de cliente OAuth de Google (Web Client ID).
// Se obtiene en: Firebase Console → Authentication → Sign-in method
//   → Google → editar (lápiz) → "Configuración del SDK web" → "ID de cliente web"
// Formato: 170676220311-XXXXXXXXXXXX.apps.googleusercontent.com
export const googleWebClientId = '170676220311-r5g1c7spn7vekpe9thhhnm7kp1i90op7.apps.googleusercontent.com';

export const firebaseConfig = {
  // Identifica tu proyecto de Firebase ante la API de Google
  apiKey: 'AIzaSyAlJVXgWZe5y2A1s91qHuXOUgZzfphzSUI',

  // Dominio de autenticación: donde Firebase redirige el flujo OAuth de Google
  authDomain: 'gestioninteligenteinvent-a0577.firebaseapp.com',

  // ID único del proyecto en la plataforma de Google Firebase
  projectId: 'gestioninteligenteinvent-a0577',

  // Bucket de Cloud Storage (no se usa en este proyecto)
  storageBucket: 'gestioninteligenteinvent-a0577.firebasestorage.app',

  // ID del remitente para Firebase Cloud Messaging / notificaciones push (no se usa)
  messagingSenderId: '170676220311',

  // ID único de esta aplicación web dentro del proyecto Firebase
  appId: '1:170676220311:web:88543845d097daae94d4d2',

  // ID de medición para Google Analytics (opcional — no es necesario para Auth)
  measurementId: 'G-48TEJ0YQX5',
};
