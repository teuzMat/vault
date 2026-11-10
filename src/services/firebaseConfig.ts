// src/services/firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SUA_APP_ID"
};

// 1. Inicializa o App do Firebase (evita duplicação no Hot Reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicialização segura do Auth com AsyncStorage e tratamento para o Fast Refresh
let auth: ReturnType<typeof getAuth>;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Se o Auth já foi inicializado em um reload anterior, recupera a instância existente
  auth = getAuth(app);
}

// 3. Instância do Banco de Dados Firestore
const db = getFirestore(app);

export { auth, db, app };