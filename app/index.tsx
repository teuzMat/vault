import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export default function LoginScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter(); 

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Por favor, preencha e-mail e senha.");
      return;
    }
    
    setLoading(true);
    try {
      // Faz o login de fato no Firebase
      await signInWithEmailAndPassword(auth, email, senha);
      // Sucesso! Vai direto para a rota explorar (Sem conflitos!)
      router.replace('/(tabs)/explorar');
    } catch (error: any) {
      console.error(error);
      alert("Erro ao entrar. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
        
        <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        
        <Text style={styles.title}>Vault.gg</Text>
        <Text style={styles.subtitle}>Sua biblioteca gamer definitiva.</Text>

        <View style={styles.formContainer}>
          
          <TextInput 
            style={styles.input} 
            placeholder="Seu e-mail" 
            placeholderTextColor="#6B7280" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={setEmail}
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="Sua senha" 
            placeholderTextColor="#6B7280" 
            secureTextEntry 
            value={senha} 
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/cadastro')}>
          <Text style={styles.registerText}>
            Ainda não é um membro? <Text style={styles.registerTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
        
        <View style={styles.authorsContainer}>
          <Text style={styles.authorsText}>Desenvolvido por:</Text>
          <Text style={styles.authorsNames}>Mateus Cantanhêde (24214290038)</Text>
          <Text style={styles.authorsNames}>Gabriel Candido (24214290023)</Text>
          <Text style={styles.authorsNames}>Matheus Henrique</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19', alignItems: 'center' },
  contentContainer: { flex: 1, width: '100%', paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  webContainer: { width: '60%' },
  logoImage: { width: 120, height: 120, marginBottom: 10 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#A78BFA', fontSize: 16, fontWeight: '600', marginBottom: 40 },
  formContainer: { width: '100%', maxWidth: 400, alignItems: 'center' },
  input: { backgroundColor: '#151A27', borderWidth: 1, borderColor: '#202638', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15, width: '100%', marginBottom: 15 },
  primaryButton: { backgroundColor: '#7C3AED', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#202638' },
  dividerText: { color: '#6B7280', paddingHorizontal: 15, fontSize: 14, fontWeight: '600' },
  registerLink: { marginTop: 20 },
  registerText: { color: '#9CA3AF', fontSize: 15 },
  registerTextBold: { color: '#A855F7', fontWeight: 'bold' },
  authorsContainer: { marginTop: 50, alignItems: 'center' },
  authorsText: { color: '#6B7280', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  authorsNames: { color: '#9CA3AF', fontSize: 11, fontWeight: '400' }
});