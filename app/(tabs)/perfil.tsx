import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  // Mock de dados do usuário (Isso virá do Firebase futuramente)
  const [fotoPerfil, setFotoPerfil] = useState('https://ui-avatars.com/api/?name=Mateus+Cantanhêde&background=7C3AED&color=fff&size=200');
  
  const handleMudarFoto = () => {
    alert('Acesso à galeria será ativado junto com o Firebase Storage!');
  };

  const handleLogout = () => {
    // router.replace apaga o histórico e volta pro login
    router.replace('/');
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={[styles.contentContainer, isWeb && styles.webContainer]} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho do Perfil */}
        <View style={styles.header}>
          <View style={styles.fotoContainer}>
            <Image source={{ uri: fotoPerfil }} style={styles.foto} />
            <TouchableOpacity style={styles.botaoMudarFoto} onPress={handleMudarFoto}>
              <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nomeUsuario}>Mateus Cantanhêde</Text>
          <Text style={styles.emailUsuario}>teuzmat@exemplo.com</Text>
        </View>

        {/* Estatísticas Gamificadas */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="controller-classic" size={24} color="#7C3AED" />
            <Text style={styles.statNumero}>42</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="trophy" size={24} color="#10B981" />
            <Text style={styles.statNumero}>8</Text>
            <Text style={styles.statLabel}>Platinas</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="star" size={24} color="#F59E0B" />
            <Text style={styles.statNumero}>15</Text>
            <Text style={styles.statLabel}>Desejos</Text>
          </View>
        </View>

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  contentContainer: { flexGrow: 1, alignSelf: 'center', width: '100%', paddingHorizontal: 20 },
  webContainer: { width: '60%', paddingTop: 40 },
  
  header: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 80 : 60, paddingBottom: 30 },
  fotoContainer: { position: 'relative', marginBottom: 15 },
  foto: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#7C3AED' },
  botaoMudarFoto: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7C3AED', padding: 10, borderRadius: 20, borderWidth: 3, borderColor: '#0B0F19' },
  
  nomeUsuario: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  emailUsuario: { color: '#9CA3AF', fontSize: 14 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#151A27', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#202638', marginBottom: 40 },
  statBox: { alignItems: 'center', flex: 1 },
  statNumero: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 8, marginBottom: 2 },
  statLabel: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase', fontWeight: '600' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#151A27', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});