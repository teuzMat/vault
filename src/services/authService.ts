// src/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  createdAt: any;
}

// 1. Criar Usuário (Auth + Salvar dados adicionais no Firestore)
export const cadastrarUsuario = async (
  nome: string,
  email: string,
  senha: string,
  cpf: string,
  dataNascimento: string
) => {
  // Criar a conta no Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const user = userCredential.user;

  // Atualizar o nome exibido no perfil do Auth
  await updateProfile(user, { displayName: nome });

  // Criar o documento do usuário no Firestore (Coleção: 'users')
  const userRef = doc(db, 'users', user.uid);
  const userProfileData: UserProfile = {
    uid: user.uid,
    nome,
    email,
    cpf,
    dataNascimento,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userProfileData);
  return userProfileData;
};

// 2. Fazer Login
export const logarUsuario = async (email: string, senha: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, senha);
  return userCredential.user;
};

// 3. Fazer Logout
export const deslogarUsuario = async () => {
  await signOut(auth);
};

// 4. Buscar Perfil do Usuário no Firestore
export const buscarPerfilUsuario = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};