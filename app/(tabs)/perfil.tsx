import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Firebase
import { auth, db } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Mock das Últimas Conquistas
const ultimasConquistas = [
  { id: '1', nome: 'Elden Ring', conquista: 'Senhor de Elden', capa: 'https://media.rawg.io/media/games/5ec/5ecac5cb026ec26a56ef04ab7cb5e006.jpg' },
  { id: '2', nome: 'Hollow Knight', conquista: 'Puro Osso', capa: 'https://media.rawg.io/media/games/4cf/4cfc6b7f185077b414276b4bc38d8af0.jpg' },
  { id: '3', nome: 'Cyberpunk 2077', conquista: 'A Cidade dos Sonhos', capa: 'https://media.rawg.io/media/games/26d/26d440e0abf48733221b6a7dc1ff2853.jpg' }
];

export default function PerfilScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  // Estados com dados do usuário
  const [nome, setNome] = useState('Carregando...');
  const [username, setUsername] = useState('@vaulter');
  const [membroDesde, setMembroDesde] = useState('Vaulter desde...');
  const [fotoPerfil, setFotoPerfil] = useState('https://ui-avatars.com/api/?name=V&background=7C3AED&color=fff&size=200');
  
  const [pais, setPais] = useState('Não informado');
  const [plataformas, setPlataformas] = useState('Nenhuma selecionada');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDadosDoUsuario = async () => {
      const usuarioLogado = auth.currentUser;
      
      if (usuarioLogado) {
        setUsername(`@${usuarioLogado.email?.split('@')[0]}`);
        
        try {
          const docRef = doc(db, "usuarios", usuarioLogado.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dados = docSnap.data();
            setNome(dados.nome);
            setFotoPerfil(`https://ui-avatars.com/api/?name=${encodeURIComponent(dados.nome)}&background=7C3AED&color=fff&size=200`);
            
            if (dados.criadoEm) {
              const dataCriacao = new Date(dados.criadoEm);
              const mes = dataCriacao.toLocaleString('pt-BR', { month: 'long' });
              const ano = dataCriacao.getFullYear();
              setMembroDesde(`Vaulter desde ${mes} de ${ano}`);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do Firestore:", error);
        }
      } else {
        router.replace('/');
      }
      setLoading(false);
    };

    buscarDadosDoUsuario();
  }, []);

  const handleMudarFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/'); 
    } catch (error) {
      alert("Erro ao sair da conta.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={[styles.contentContainer, isWeb && styles.webContainer]} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho do Perfil na Esquerda */}
        <View style={styles.headerRow}>
          <View style={styles.fotoContainer}>
            <Image source={{ uri: fotoPerfil }} style={styles.foto} />
            <TouchableOpacity onPress={handleMudarFoto} style={styles.botaoMudarFoto}>
              <MaterialCommunityIcons color="#FFFFFF" name="camera" size={16} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.nomeUsuario}>{nome}</Text>
            <Text style={styles.usernameText}>{username}</Text>
            <View style={styles.vaulterBadge}>
              <MaterialCommunityIcons color="#7C3AED" name="shield-star" size={14} />
              <Text style={styles.vaulterText}>{membroDesde}</Text>
            </View>
          </View>
        </View>

        {/* Sobre Mim e Edição */}
        <View style={styles.sobreContainer}>
          <View style={styles.sobreRow}>
            <Text style={styles.sectionTitle}>Sobre Mim</Text>
            <TouchableOpacity onPress={() => alert('Tela de edição será criada em breve!')} style={styles.btnEditarPerfil}>
              <MaterialCommunityIcons color="#A78BFA" name="pencil" size={14} />
              <Text style={styles.btnEditarTexto}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>País:</Text>
            <Text style={styles.infoValor}>{pais}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Plataformas:</Text>
            <Text style={styles.infoValor}>{plataformas}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumero}>42</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumero, { color: '#10B981' }]}>8</Text>
            <Text style={styles.statLabel}>Platinas</Text>
          </View>
        </View>

        {/* Últimas Conquistas */}
        <Text style={styles.sectionTitle}>Últimas Conquistas</Text>
        <View style={styles.conquistasContainer}>
          {ultimasConquistas.map((jogo) => (
            <View key={jogo.id} style={styles.conquistaCard}>
              <Image source={{ uri: jogo.capa }} style={styles.conquistaCapa} />
              <View style={styles.conquistaInfo}>
                <Text style={styles.conquistaNomeJogo}>{jogo.nome}</Text>
                <View style={styles.conquistaBadge}>
                  <MaterialCommunityIcons color="#F59E0B" name="trophy" size={12} />
                  <Text style={styles.conquistaTexto}>{jogo.conquista}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Botão de Logout */}
        <View style={styles.footerContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons color="#EF4444" name="logout" size={18} />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  contentContainer: { flexGrow: 1, alignSelf: 'center', width: '100%', paddingHorizontal: 20, paddingBottom: 40 },
  webContainer: { width: '60%', paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 80 : 40, paddingBottom: 30 },
  fotoContainer: { position: 'relative', marginRight: 20 },
  foto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#7C3AED' },
  botaoMudarFoto: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7C3AED', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#0B0F19' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  nomeUsuario: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  usernameText: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  vaulterBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A27', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#202638' },
  vaulterText: { color: '#A78BFA', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  sobreContainer: { marginBottom: 25, backgroundColor: '#151A27', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#202638' },
  sobreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  btnEditarPerfil: { flexDirection: 'row', alignItems: 'center' },
  btnEditarTexto: { color: '#A78BFA', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  infoBox: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { color: '#6B7280', fontSize: 14, width: 90 },
  infoValor: { color: '#D1D5DB', fontSize: 14, flex: 1 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#151A27', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#202638', marginBottom: 30 },
  statBox: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, backgroundColor: '#202638' },
  statNumero: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase', fontWeight: '600' },
  conquistasContainer: { marginBottom: 30 },
  conquistaCard: { flexDirection: 'row', backgroundColor: '#151A27', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#202638', alignItems: 'center' },
  conquistaCapa: { width: 50, height: 70, borderRadius: 8, marginRight: 12 },
  conquistaInfo: { flex: 1 },
  conquistaNomeJogo: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  conquistaBadge: { flexDirection: 'row', alignItems: 'center' },
  conquistaTexto: { color: '#F59E0B', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  footerContainer: { alignItems: 'flex-start', marginTop: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }
});