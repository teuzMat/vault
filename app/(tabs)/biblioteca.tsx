import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Firebase
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

type JogoSalvo = {
  id: string;
  nome: string;
  capa: string;
  plataforma: string;
  status: 'Jogando' | 'Platinado' | 'Desejos';
  progresso: number;
};

export default function BibliotecaScreen() {
  const isWeb = Platform.OS === 'web';
  const [filtroAtivo, setFiltroAtivo] = useState<'Todos' | 'Jogando' | 'Platinado' | 'Desejos'>('Todos');
  
  const [meusJogos, setMeusJogos] = useState<JogoSalvo[]>([]);
  const [loading, setLoading] = useState(true);

  // FUNÇÃO DO GABRIEL: Escuta o banco de dados em tempo real
  useEffect(() => {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) return;

    const jogosRef = collection(db, "usuarios", usuarioLogado.uid, "jogos");
    
    const unsubscribe = onSnapshot(jogosRef, (snapshot) => {
      const jogosBuscados: JogoSalvo[] = [];
      snapshot.forEach((doc) => {
        jogosBuscados.push(doc.data() as JogoSalvo);
      });
      setMeusJogos(jogosBuscados);
      setLoading(false);
    });

    return () => unsubscribe(); // Limpa o listener ao fechar a tela
  }, []);

  const jogosFiltrados = meusJogos.filter(jogo => filtroAtivo === 'Todos' || jogo.status === filtroAtivo);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Platinado': return { color: '#10B981', icon: 'trophy' };
      case 'Desejos': return { color: '#F59E0B', icon: 'star' };
      default: return { color: '#7C3AED', icon: 'controller-classic' };
    }
  };

  const renderJogo = ({ item }: { item: JogoSalvo }) => {
    const statusInfo = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.capa }} style={styles.capa} />
        <View style={styles.cardInfo}>
          <Text style={styles.nomeJogo} numberOfLines={1}>{item.nome}</Text>
          <View style={styles.plataformaContainer}>
            <MaterialCommunityIcons name="monitor" size={14} color="#9CA3AF" />
            <Text style={styles.plataformaTexto}>{item.plataforma}</Text>
          </View>
          {item.status !== 'Desejos' && (
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
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
        <Text style={styles.title}>Minha Biblioteca</Text>
        <View style={styles.filtrosContainer}>
          {['Todos', 'Jogando', 'Platinado', 'Desejos'].map((filtro) => (
            <TouchableOpacity key={filtro} style={[styles.filtroBtn, filtroAtivo === filtro && styles.filtroBtnAtivo]} onPress={() => setFiltroAtivo(filtro as any)}>
              <Text style={[styles.filtroTexto, filtroAtivo === filtro && styles.filtroTextoAtivo]}>{filtro}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <FlatList data={jogosFiltrados} keyExtractor={(item) => item.id} renderItem={renderJogo} contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum jogo encontrado nesta categoria.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  contentContainer: { flex: 1, width: '100%', alignSelf: 'center' },
  webContainer: { width: '60%', paddingHorizontal: 30, paddingTop: 40 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20 },
  filtrosContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
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
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 40, fontSize: 14 }
});