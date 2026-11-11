import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Firebase
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PerfilScreen() {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();

  const [nome, setNome] = useState('Carregando...');
  const [username, setUsername] = useState('@vaulter');
  const [membroDesde, setMembroDesde] = useState('Vaulter desde...');
  const [fotoPerfil, setFotoPerfil] = useState('');
  
  // Estados para exibição
  const [pais, setPais] = useState('Não informado');
  const [plataformas, setPlataformas] = useState('Nenhuma selecionada');
  
  // Estados do Modal de Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editPais, setEditPais] = useState('');
  const [editPlataformas, setEditPlataformas] = useState('');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Estatísticas Reais
  const [totalJogos, setTotalJogos] = useState(0);
  const [totalPlatinas, setTotalPlatinas] = useState(0);
  const [ultimasConquistas, setUltimasConquistas] = useState<any[]>([]);

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
          
          // Puxa o país e plataformas se já existirem no banco
          if (dados.pais) setPais(dados.pais);
          if (dados.plataformas) setPlataformas(dados.plataformas);
          
          if (dados.criadoEm) {
            const dataCriacao = new Date(dados.criadoEm);
            setMembroDesde(`Vaulter desde ${dataCriacao.toLocaleString('pt-BR', { month: 'long' })} de ${dataCriacao.getFullYear()}`);
          }
        }
      } catch (error) {
        console.error("Erro:", error);
      }
      setLoading(false);
    };

    const q = query(collection(db, "usuarios", usuarioLogado.uid, "jogos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let qtdJogos = 0;
      let qtdPlatinas = 0;
      const ultimos: any[] = [];
      
      snapshot.forEach((doc) => {
        const jogo = doc.data();
        qtdJogos++;
        if (jogo.status === 'Platinado') qtdPlatinas++;
        if (ultimos.length < 3 && jogo.status !== 'Desejos') ultimos.push(jogo); 
      });

      setTotalJogos(qtdJogos);
      setTotalPlatinas(qtdPlatinas);
      setUltimasConquistas(ultimos);
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
        
        await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
          fotoPerfil: downloadURL
        });
        
        setFotoPerfil(downloadURL);
      } catch (error) {
        console.error("Erro ao subir foto:", error);
        alert("Falha ao salvar a imagem.");
      } finally {
        setUploading(false);
      }
    }
  };

  const abrirModalEdicao = () => {
    setEditPais(pais !== 'Não informado' ? pais : '');
    setEditPlataformas(plataformas !== 'Nenhuma selecionada' ? plataformas : '');
    setModalVisible(true);
  };

  const handleSalvarPerfil = async () => {
    if (!auth.currentUser) return;
    setSalvandoPerfil(true);

    try {
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        pais: editPais || 'Não informado',
        plataformas: editPlataformas || 'Nenhuma selecionada'
      });
      
      setPais(editPais || 'Não informado');
      setPlataformas(editPlataformas || 'Nenhuma selecionada');
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao salvar os dados.");
    } finally {
      setSalvandoPerfil(false);
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
          <View style={styles.infoBox}><Text style={styles.infoLabel}>Plataformas:</Text><Text style={styles.infoValor}>{plataformas}</Text></View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statNumero}>{totalJogos}</Text><Text style={styles.statLabel}>Jogos</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}><Text style={[styles.statNumero, { color: '#10B981' }]}>{totalPlatinas}</Text><Text style={styles.statLabel}>Platinas</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Últimos Jogos</Text>
        <View style={styles.conquistasContainer}>
          {ultimasConquistas.length > 0 ? ultimasConquistas.map((jogo) => (
            <View key={jogo.id} style={styles.conquistaCard}>
              <Image source={{ uri: jogo.capa }} style={styles.conquistaCapa} />
              <View style={styles.conquistaInfo}>
                <Text style={styles.conquistaNomeJogo}>{jogo.nome}</Text>
                <View style={styles.conquistaBadge}>
                  <MaterialCommunityIcons color={jogo.status === 'Platinado' ? '#10B981' : '#7C3AED'} name={jogo.status === 'Platinado' ? 'trophy' : 'controller-classic'} size={12} />
                  <Text style={[styles.conquistaTexto, {color: jogo.status === 'Platinado' ? '#10B981' : '#7C3AED'}]}>{jogo.status}</Text>
                </View>
              </View>
            </View>
          )) : <Text style={{color: '#6B7280'}}>Nenhum jogo iniciado ainda.</Text>}
        </View>

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
              <TextInput style={styles.input} placeholder="Ex: PS5, PC, Switch" placeholderTextColor="#6B7280" value={editPlataformas} onChangeText={setEditPlataformas} />
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
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  
  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#151A27', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#202638' },
  webModalContent: { width: '40%', minWidth: 350 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#202638', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 14 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: 'transparent' },
  modalBtnCancelText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
  modalBtnSave: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#7C3AED' },
  modalBtnSaveText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});