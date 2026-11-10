import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const handleCpfChange = (text: string) => {
    let rawText = text.replace(/\D/g, '');
    if (rawText.length > 11) rawText = rawText.slice(0, 11);
    
    // Aplica a máscara 000.000.000-00
    let maskedCpf = rawText;
    if (rawText.length > 9) maskedCpf = rawText.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (rawText.length > 6) maskedCpf = rawText.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (rawText.length > 3) maskedCpf = rawText.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    
    setCpf(maskedCpf);
  };

  const validaCalculoCpf = (cpfTest: string) => {
    const limpo = cpfTest.replace(/\D/g, '');
    if (limpo.length !== 11 || /^(\d)\1{10}$/.test(limpo)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(limpo.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(limpo.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(limpo.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(limpo.substring(10, 11))) return false;
    return true;
  };

  // Máscara de Data de Nascimento (DD/MM/YYYY)
  const handleDataChange = (text: string) => {
    let rawText = text.replace(/\D/g, '');
    if (rawText.length > 8) rawText = rawText.slice(0, 8);
    
    let maskedData = rawText;
    if (rawText.length > 4) maskedData = rawText.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    else if (rawText.length > 2) maskedData = rawText.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    
    setDataNascimento(maskedData);
  };

  // Validador de Força de Senha (Maiúscula, Minúscula, Número e Especial)
  const validaForcaSenha = (senhaTest: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(senhaTest);
  };

  // Ação ao clicar em Cadastrar
  const handleCadastro = () => {
    if (!nome || !email || !cpf || !dataNascimento || !senha || !confirmaSenha) {
      alert("Erro: Preencha todos os campos.");
      return;
    }
    if (!validaCalculoCpf(cpf)) {
      alert("Erro: CPF inválido.");
      return;
    }
    if (dataNascimento.length !== 10) {
      alert("Erro: Data de nascimento incompleta.");
      return;
    }
    if (!validaForcaSenha(senha)) {
      alert("Senha fraca!\nEla deve conter NO MÍNIMO:\n- 6 caracteres\n- Uma letra Maiúscula\n- Uma letra Minúscula\n- Um número\n- Um caractere especial (@$!%*?&)");
      return;
    }
    if (senha !== confirmaSenha) {
      alert("Erro: As senhas não coincidem.");
      return;
    }

    alert("Sucesso! Tudo validado perfeitamente, conta criada.");
    router.back(); 
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
          
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se ao Vault.gg e organize sua coleção.</Text>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput style={styles.input} placeholder="Digite seu nome completo" placeholderTextColor="#6B7280" value={nome} onChangeText={setNome}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput style={styles.input} placeholder="seuemail@dominio.com" placeholderTextColor="#6B7280" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput style={styles.input} placeholder="000.000.000-00" placeholderTextColor="#6B7280" keyboardType="numeric" value={cpf} onChangeText={handleCpfChange}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor="#6B7280" keyboardType="numeric" value={dataNascimento} onChangeText={handleDataChange}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha (Forte)</Text>
              <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#6B7280" secureTextEntry value={senha} onChangeText={setSenha}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirme sua Senha</Text>
              <TextInput style={styles.input} placeholder="Digite a senha novamente" placeholderTextColor="#6B7280" secureTextEntry value={confirmaSenha} onChangeText={setConfirmaSenha}/>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleCadastro}>
              <Text style={styles.primaryButtonText}>Cadastrar e Validar</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backText}>Já possui conta? <Text style={styles.backTextBold}>Fazer Login</Text></Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContainer: { flexGrow: 1, alignItems: 'center' },
  contentContainer: { flex: 1, width: '100%', paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  webContainer: { width: '60%' },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: '#A78BFA', fontSize: 16, fontWeight: '600', marginBottom: 40, textAlign: 'center' },
  formContainer: { width: '100%', maxWidth: 400 },
  inputGroup: { marginBottom: 15, width: '100%' },
  label: { color: '#D1D5DB', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#151A27', borderWidth: 1, borderColor: '#202638', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  primaryButton: { backgroundColor: '#7C3AED', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 15, shadowColor: '#7C3AED', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backLink: { marginTop: 40 },
  backText: { color: '#9CA3AF', fontSize: 15 },
  backTextBold: { color: '#A855F7', fontWeight: 'bold' }
});