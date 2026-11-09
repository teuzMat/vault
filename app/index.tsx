import { StyleSheet, Text, View, Image, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  // Verificação para aplicar a Regra 20-60-20 no navegador
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.background}>
      {/* 
        Este é o Container de Conteúdo. 
        No Mobile ele tem 100% de largura.
        Na Web ele tem 60% de largura (deixando 20% de sobra de cada lado) 
      */}
      <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
        
        {/* Logo do Vault.gg inserida com sucesso */}
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Vault.gg</Text>
        <Text style={styles.subtitle}>Sua biblioteca gamer definitiva.</Text>

        {/* Área de Botões de Acesso */}
        <View style={styles.formContainer}>
          
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Entrar com e-mail e senha</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              {/* O ideal depois é colocarmos os ícones aqui com @expo/vector-icons */}
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>GitHub</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Opção de Cadastro */}
        <TouchableOpacity style={styles.registerLink}>
          <Text style={styles.registerText}>
            Ainda não é um membro? <Text style={styles.registerTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>

      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center', // Garante que o container central fique no meio
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    width: '60%', // Regra 20-60-20 aplicada!
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#A78BFA', // Roxo secundário
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, // Limita o formulário para não ficar gigante mesmo dentro dos 60%
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#202638',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#151A27',
    borderWidth: 1,
    borderColor: '#202638',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#D1D5DB',
    fontSize: 15,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 40,
  },
  registerText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  registerTextBold: {
    color: '#A855F7',
    fontWeight: 'bold',
  }
});