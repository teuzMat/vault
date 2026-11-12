import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Firebase
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth'; // Importação nova para evitar tela infinita
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

type JogoSalvo = {
  id: string;
  nome: string;
  capa: string;
  plataforma: string;
  status: 'Desejos' | 'Na Fila' | 'Jogando' | 'Concluído' | 'Platinado';
  progresso: number;
};

const STATUS_OPCOES = ['Desejos', 'Na Fila', 'Jogando', 'Concluído', 'Platinado'];
const PLATAFORMAS_OPCOES = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile'];

export default function BibliotecaScreen() {
  const isWeb = Platform.OS === 'web';
  const [filtroAtivo, setFiltroAtivo] = useState<string>('Todos');
  const [meusJogos, setMeusJogos] = useState<JogoSalvo[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [jogoEditando, setJogoEditando] = useState<JogoSalvo | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPlataforma, setEditPlataforma] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    // Observa mudanças na autenticação para não dar erro de carregamento infinito
    const unsubscribeAuth = onAuthStateChanged(auth, (usuarioLogado) => {
      if (usuarioLogado) {
        const jogosRef = collection(db, "usuarios", usuarioLogado.uid, "jogos");
        
        unsubscribeSnapshot = onSnapshot(jogosRef, (snapshot) => {
          const jogosBuscados: JogoSalvo[] = [];
          snapshot.forEach((docSnap) => {
            jogosBuscados.push(docSnap.data() as JogoSalvo);
          });
          setMeusJogos(jogosBuscados);
          setLoading(false);
        }, (error) => {
          console.error("Erro no Firestore:", error);
          setLoading(false); // Para o loading mesmo se der erro
        });
      } else {
        setLoading(false); // Se não tiver usuário, para o loading
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const jogosFiltrados = meusJogos.filter(jogo => filtroAtivo === 'Todos' || jogo.status === filtroAtivo);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Platinado': return { color: '#10B981', icon: 'trophy' };
      case 'Concluído': return { color: '#3B82F6', icon: 'check-decagram' };
      case 'Jogando': return { color: '#7C3AED', icon: 'controller-classic' };
      case 'Na Fila': return { color: '#F97316', icon: 'format-list-bulleted' };
      case 'Desejos': return { color: '#F59E0B', icon: 'star' };
      default: return { color: '#9CA3AF', icon: 'gamepad' };
    }
  };

  const abrirModalEdicao = (jogo: JogoSalvo) => {
    setJogoEditando(jogo);
    setEditStatus(jogo.status);
    const platBase = PLATAFORMAS_OPCOES.find(p => jogo.plataforma.toLowerCase().includes(p.toLowerCase()));
    setEditPlataforma(platBase || jogo.plataforma);
    setModalVisible(true);
  };

  const salvarEdicaoJogo = async () => {
    if (!auth.currentUser || !jogoEditando) return;
    setSalvando(true);

    try {
      const jogoRef = doc(db, "usuarios", auth.currentUser.uid, "jogos", jogoEditando.id);
      
      let novoProgresso = jogoEditando.progresso;
      if (editStatus === 'Platinado') novoProgresso = 100;
      if (editStatus === 'Desejos' || editStatus === 'Na Fila') novoProgresso = 0;

      await updateDoc(jogoRef, {
        status: editStatus,
        plataforma: editPlataforma,
        progresso: novoProgresso
      });
      
      setModalVisible(false);
    } catch (error) {
      alert("Erro ao atualizar o jogo.");
    } finally {
      setSalvando(false);
    }
  };

  const renderJogo = ({ item }: { item: JogoSalvo }) => {
    const statusInfo = getStatusStyle(item.status);

    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirModalEdicao(item)} activeOpacity={0.7}>
        <Image source={{ uri: item.capa }} style={styles.capa} />
        <View style={styles.cardInfo}>
          <Text style={styles.nomeJogo} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.plataformaContainer}>
            <MaterialCommunityIcons name="monitor" size={14} color="#9CA3AF" />
            <Text style={styles.plataformaTexto}>{item.plataforma}</Text>
          </View>
          
          {item.status !== 'Desejos' && item.status !== 'Na Fila' && (
            <View style={styles.progressoContainer}>
              <View style={styles.barraFundo}>
                <View style={[styles.barraPreenchida, { width: `${item.progresso}%`, backgroundColor: statusInfo.color }]} />
              </View>
              <Text style={styles.progressoTexto}>{item.progresso}%</Text>
            </View>
          )}
          
          <View style={[styles.badge, { borderColor: statusInfo.color }]}>
            <MaterialCommunityIcons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
            <Text style={[styles.badgeTexto, { color: statusInfo.color }]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.background}>
      <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
        <Text style={styles.title}>Minha Biblioteca</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll} contentContainerStyle={styles.filtrosContainer}>
          {['Todos', 'Desejos', 'Na Fila', 'Jogando', 'Concluído', 'Platinado'].map((filtro) => (
            <TouchableOpacity key={filtro} style={[styles.filtroBtn, filtroAtivo === filtro && styles.filtroBtnAtivo]} onPress={() => setFiltroAtivo(filtro)}>
              <Text style={[styles.filtroTexto, filtroAtivo === filtro && styles.filtroTextoAtivo]}>{filtro}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={{color: '#9CA3AF', marginTop: 10}}>Sincronizando jogos...</Text>
          </View>
        ) : (
          <FlatList data={jogosFiltrados} keyExtractor={(item) => item.id} renderItem={renderJogo} contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum jogo encontrado nesta categoria.</Text>}
          />
        )}
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isWeb && styles.webModalContent]}>
            {jogoEditando && (
              <>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: jogoEditando.capa }} style={styles.modalCapa} />
                  <View style={{flex: 1}}>
                    <Text style={styles.modalTitle} numberOfLines={2}>{jogoEditando.nome}</Text>
                    
                    <TouchableOpacity style={styles.btnConquistas} onPress={() => alert('API de Conquistas em desenvolvimento!')}>
                      <MaterialCommunityIcons name="trophy-award" size={16} color="#7C3AED" />
                      <Text style={styles.btnConquistasTexto}>Ver Conquistas</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>Status do Jogo</Text>
                <View style={styles.opcoesContainer}>
                  {STATUS_OPCOES.map(status => (
                    <TouchableOpacity key={status} style={[styles.chip, editStatus === status && styles.chipAtivo]} onPress={() => setEditStatus(status)}>
                      <Text style={[styles.chipTexto, editStatus === status && styles.chipTextoAtivo]}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Plataforma que estou jogando</Text>
                <View style={styles.opcoesContainer}>
                  {PLATAFORMAS_OPCOES.map(plat => (
                    <TouchableOpacity key={plat} style={[styles.chip, editPlataforma === plat && styles.chipAtivo]} onPress={() => setEditPlataforma(plat)}>
                      <Text style={[styles.chipTexto, editPlataforma === plat && styles.chipTextoAtivo]}>{plat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalBtnSave} onPress={salvarEdicaoJogo} disabled={salvando}>
                    {salvando ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalBtnSaveText}>Salvar Jogo</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  contentContainer: { flex: 1, width: '100%', alignSelf: 'center' },
  webContainer: { width: '60%', paddingHorizontal: 30, paddingTop: 40 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 10 },
  
  filtrosScroll: { flexGrow: 0, marginBottom: 15 },
  filtrosContainer: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  filtroBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#151A27', borderWidth: 1, borderColor: '#202638' },
  filtroBtnAtivo: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filtroTexto: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  filtroTextoAtivo: { color: '#FFFFFF' },
  
  listaContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#151A27', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#202638' },
  capa: { width: 90, height: 120, resizeMode: 'cover' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  nomeJogo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  plataformaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  plataformaTexto: { color: '#9CA3AF', fontSize: 12, marginLeft: 4 },
  progressoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barraFundo: { flex: 1, height: 6, backgroundColor: '#0B0F19', borderRadius: 3, marginRight: 10, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 3 },
  progressoTexto: { color: '#D1D5DB', fontSize: 12, fontWeight: 'bold', width: 35, textAlign: 'right' },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, backgroundColor: '#0B0F19' },
  badgeTexto: { fontSize: 10, fontWeight: 'bold', marginLeft: 4, textTransform: 'uppercase' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 40, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#151A27', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#202638' },
  webModalContent: { width: '40%', minWidth: 350 },
  modalHeader: { flexDirection: 'row', marginBottom: 20 },
  modalCapa: { width: 70, height: 100, borderRadius: 8, marginRight: 15 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  btnConquistas: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0F19', padding: 8, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#7C3AED' },
  btnConquistasTexto: { color: '#7C3AED', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  label: { color: '#D1D5DB', fontSize: 13, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#0B0F19', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#202638' },
  chipAtivo: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTexto: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: '#FFFFFF' },
  
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalBtnCancelText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
  modalBtnSave: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#7C3AED' },
  modalBtnSaveText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});