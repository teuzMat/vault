import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { auth, db, storage } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PLATAFORMAS_OPCOES = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile'];

export default function PerfilScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [nome, setNome] = useState('Carregando...');
  const [username, setUsername] = useState('@vaulter');
  const [membroDesde, setMembroDesde] = useState('Vaulter desde...');
  const [fotoPerfil, setFotoPerfil] = useState('');
  
  const [pais, setPais] = useState('Não informado');
  const [plataformas, setPlataformas] = useState<string[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editPais, setEditPais] = useState('');
  const [editPlataformas, setEditPlataformas] = useState<string[]>([]);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [meusJogos, setMeusJogos] = useState<any[]>([]);

  useEffect(() => {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) {
      router.replace('/');
      return;
    }

    setUsername(`@${usuarioLogado.email?.split('@')[0]}`);
        
    const buscarUsuario = async () => {
      try {
        const docSnap = await getDoc(doc(db, "usuarios", usuarioLogado.uid));
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNome(dados.nome);
          setFotoPerfil(dados.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(dados.nome)}&background=7C3AED&color=fff&size=200`);
          
          if (dados.pais) setPais(dados.pais);
          if (dados.plataformas && Array.isArray(dados.plataformas)) setPlataformas(dados.plataformas);
          
          if (dados.criadoEm) {
            const dataCriacao = new Date(dados.criadoEm);
            setMembroDesde(`Vaulter desde ${dataCriacao.toLocaleString('pt-BR', { month: 'long' })} de ${dataCriacao.getFullYear()}`);
          }
        }
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    const unsubscribe = onSnapshot(collection(db, "usuarios", usuarioLogado.uid, "jogos"), (snapshot) => {
      const jogosBuscados: any[] = [];
      snapshot.forEach((doc) => jogosBuscados.push(doc.data()));
      setMeusJogos(jogosBuscados);
      setLoading(false);
    });

    buscarUsuario();
    return () => unsubscribe();
  }, []);

  const handleMudarFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && auth.currentUser) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "usuarios", auth.currentUser.uid), { fotoPerfil: downloadURL });
        setFotoPerfil(downloadURL);
      } catch (error) {
        alert("Falha ao salvar a imagem.");
      } finally {
        setUploading(false);
      }
    }
  };

  const abrirModalEdicao = () => {
    setEditPais(pais !== 'Não informado' ? pais : '');
    setEditPlataformas([...plataformas]);
    setModalVisible(true);
  };

  const togglePlataforma = (plat: string) => {
    if (editPlataformas.includes(plat)) {
      setEditPlataformas(editPlataformas.filter(p => p !== plat));
    } else {
      setEditPlataformas([...editPlataformas, plat]);
    }
  };

  const handleSalvarPerfil = async () => {
    if (!auth.currentUser) return;
    setSalvandoPerfil(true);
    try {
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        pais: editPais || 'Não informado',
        plataformas: editPlataformas
      });
      setPais(editPais || 'Não informado');
      setPlataformas(editPlataformas);
      setModalVisible(false);
    } catch (error) {
      alert("Erro ao salvar os dados.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); router.replace('/'); } catch (error) {}
  };

  // Função para definir as cores das plataformas
  const getCorPlataforma = (plat: string) => {
    const p = plat.toLowerCase();
    if (p.includes('playstation') || p.includes('ps')) return '#2563EB'; // Azul
    if (p.includes('xbox')) return '#16A34A'; // Verde
    if (p.includes('nintendo') || p.includes('switch')) return '#DC2626'; // Vermelho
    if (p.includes('pc') || p.includes('windows')) return '#4B5563'; // Cinza
    if (p.includes('mobile') || p.includes('android') || p.includes('ios')) return '#F59E0B'; // Amarelo
    return '#7C3AED'; // Padrão
  };

  // Separando os jogos por categorias
  const jogosNaFila = meusJogos.filter(j => j.status === 'Na Fila');
  const jogosJogando = meusJogos.filter(j => j.status === 'Jogando');
  const jogosConcluidos = meusJogos.filter(j => j.status === 'Concluído');
  const jogosPlatinados = meusJogos.filter(j => j.status === 'Platinado');

  const renderCarrossel = (titulo: string, listaJogos: any[]) => {
    if (listaJogos.length === 0) return null;
    return (
      <View style={styles.secaoJogos}>
        <Text style={styles.sectionTitle}>{titulo} ({listaJogos.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {listaJogos.map((jogo) => {
            const corPlat = getCorPlataforma(jogo.plataforma);
            return (
              <View key={jogo.id} style={styles.miniCard}>
                <Image source={{ uri: jogo.capa }} style={styles.miniCapa} />
                <Text style={styles.miniNome} numberOfLines={1}>{jogo.nome}</Text>
                <View style={[styles.badgePlataforma, { backgroundColor: corPlat }]}>
                  <Text style={styles.badgePlataformaTexto}>{jogo.plataforma}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (loading) return <View style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color="#7C3AED" size="large" /></View>;

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={[styles.contentContainer, isWeb && styles.webContainer]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <View style={styles.fotoContainer}>
            <Image source={{ uri: fotoPerfil }} style={styles.foto} />
            <TouchableOpacity onPress={handleMudarFoto} style={styles.botaoMudarFoto} disabled={uploading}>
              {uploading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons color="#FFFFFF" name="camera" size={16} />}
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

        <View style={styles.sobreContainer}>
          <View style={styles.sobreRow}>
            <Text style={styles.sectionTitle}>Sobre Mim</Text>
            <TouchableOpacity onPress={abrirModalEdicao} style={styles.btnEditarPerfil}>
              <MaterialCommunityIcons color="#A78BFA" name="pencil" size={14} />
              <Text style={styles.btnEditarTexto}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}><Text style={styles.infoLabel}>País:</Text><Text style={styles.infoValor}>{pais}</Text></View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Plataformas:</Text>
            <Text style={styles.infoValor}>
              {plataformas.length > 0 ? plataformas.join(', ') : 'Nenhuma selecionada'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statNumero}>{meusJogos.length}</Text><Text style={styles.statLabel}>Total de Jogos</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}><Text style={[styles.statNumero, { color: '#10B981' }]}>{jogosPlatinados.length}</Text><Text style={styles.statLabel}>Platinas</Text></View>
        </View>

        {/* Listas de Jogos Categorizadas */}
        {renderCarrossel('🎮 Jogando no Momento', jogosJogando)}
        {renderCarrossel('⏳ Na Fila para Jogar', jogosNaFila)}
        {renderCarrossel('✅ Concluídos', jogosConcluidos)}
        {renderCarrossel('🏆 Platinados', jogosPlatinados)}

        {meusJogos.length === 0 && (
          <Text style={{color: '#6B7280', textAlign: 'center', marginVertical: 20}}>Nenhum jogo iniciado ainda.</Text>
        )}

        <View style={styles.footerContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons color="#EF4444" name="logout" size={18} />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Modal de Edição de Perfil */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isWeb && styles.webModalContent]}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>País</Text>
              <TextInput style={styles.input} placeholder="Ex: Brasil" placeholderTextColor="#6B7280" value={editPais} onChangeText={setEditPais} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plataformas Favoritas</Text>
              <View style={styles.opcoesContainer}>
                {PLATAFORMAS_OPCOES.map(plat => {
                  const ativo = editPlataformas.includes(plat);
                  return (
                    <TouchableOpacity key={plat} style={[styles.chip, ativo && styles.chipAtivo]} onPress={() => togglePlataforma(plat)}>
                      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{plat}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSalvarPerfil} disabled={salvandoPerfil}>
                {salvandoPerfil ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalBtnSaveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
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
  
  // Estilos do Carrossel de Jogos
  secaoJogos: { marginBottom: 25 },
  miniCard: { width: 100, marginRight: 15, alignItems: 'flex-start' },
  miniCapa: { width: 100, height: 140, borderRadius: 8, marginBottom: 8 },
  miniNome: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  badgePlataforma: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgePlataformaTexto: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  footerContainer: { alignItems: 'flex-start', marginTop: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  
  // Modal de Edição (Agora com Checkboxes/Chips)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#151A27', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#202638' },
  webModalContent: { width: '40%', minWidth: 350 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  input: { backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#202638', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 14 },
  
  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#0B0F19', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#202638' },
  chipAtivo: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTexto: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: '#FFFFFF' },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: 'transparent' },
  modalBtnCancelText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
  modalBtnSave: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#7C3AED' },
  modalBtnSaveText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});