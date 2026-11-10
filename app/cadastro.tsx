import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { maskCPF, validateCPF, maskDate, validateDate, checkPasswordStrength } from '../utils/validators';

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataError, setDataError] = useState('');
  
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaError, setSenhaError] = useState('');
  
  const [focusedInput, setFocusedInput] = useState('');

  const passwordStrength = checkPasswordStrength(senha);

  const handleCpfChange = (text: string) => {
    setCpf(maskCPF(text));
    if (cpfError) setCpfError('');
  };

  const handleCpfBlur = () => {
    setFocusedInput('');
    if (cpf.length > 0 && !validateCPF(cpf)) {
      setCpfError('CPF inválido.');
    }
  };

  const handleDataChange = (text: string) => {
    setDataNascimento(maskDate(text));
    if (dataError) setDataError('');
  };

  const handleDataBlur = () => {
    setFocusedInput('');
    if (dataNascimento.length > 0 && !validateDate(dataNascimento)) {
      setDataError('Data inválida (DD/MM/AAAA).');
    }
  };

  const handleConfirmarSenhaBlur = () => {
    setFocusedInput('');
    if (confirmarSenha.length > 0 && senha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem.');
    } else {
      setSenhaError('');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Criar Conta</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={[styles.input, focusedInput === 'nome' && styles.inputFocused]}
          value={nome}
          onChangeText={setNome}
          onFocus={() => setFocusedInput('nome')}
          onBlur={() => setFocusedInput('')}
          placeholder="Digite seu nome"
          placeholderTextColor="#4B5563"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput('')}
          placeholder="seu@email.com"
          placeholderTextColor="#4B5563"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={[styles.input, focusedInput === 'cpf' && styles.inputFocused, cpfError ? styles.inputError : null]}
          value={cpf}
          onChangeText={handleCpfChange}
          onFocus={() => setFocusedInput('cpf')}
          onBlur={handleCpfBlur}
          placeholder="000.000.000-00"
          placeholderTextColor="#4B5563"
          keyboardType="numeric"
          maxLength={14}
        />
        {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput
          style={[styles.input, focusedInput === 'data' && styles.inputFocused, dataError ? styles.inputError : null]}
          value={dataNascimento}
          onChangeText={handleDataChange}
          onFocus={() => setFocusedInput('data')}
          onBlur={handleDataBlur}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#4B5563"
          keyboardType="numeric"
          maxLength={10}
        />
        {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={[styles.input, focusedInput === 'senha' && styles.inputFocused]}
          value={senha}
          onChangeText={setSenha}
          onFocus={() => setFocusedInput('senha')}
          onBlur={() => setFocusedInput('')}
          placeholder="Crie uma senha forte"
          placeholderTextColor="#4B5563"
          secureTextEntry
        />
        {senha.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color, width: `${(passwordStrength.score / 5) * 100}%` }]} />
            <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={[styles.input, focusedInput === 'confirmar' && styles.inputFocused, senhaError ? styles.inputError : null]}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          onFocus={() => setFocusedInput('confirmar')}
          onBlur={handleConfirmarSenhaBlur}
          placeholder="Repita sua senha"
          placeholderTextColor="#4B5563"
          secureTextEntry
        />
        {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
      </View>

      <TouchableOpacity style={styles.buttonSubmit}>
        <Text style={styles.buttonSubmitText}>Finalizar Cadastro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonBack} onPress={() => router.back()}>
        <Text style={styles.buttonBackText}>Voltar para o Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#E2E8F0',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#151A27',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#7C3AED',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  strengthContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginRight: 10,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonSubmit: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonBack: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonBackText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});