import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Firebase
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const CLIENT_ID = 'cvqw5ts90zgsjhogvbbys2az20yeh0';
const CLIENT_SECRET = 'x1c2tj7l7wt258jhozequg3rc69075';

export default function ExplorarScreen() {
  const isWeb = Platform.OS === 'web';
  const [jogos, setJogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tokenAutenticacao, setTokenAutenticacao] = useState('');

  const proxyCORS = isWeb ? 'https://cors-anywhere.herokuapp.com/' : '';

  const autenticarIGDB = async () => {
    try {
      const url = `${proxyCORS}https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
      const resposta = await fetch(url, { method: 'POST' });
      const dados = await resposta.json();
      setTokenAutenticacao(dados.access_token);
    } catch (error) {
      console.error("Erro na Autenticação:", error);
    }
  };

  const buscarJogos = async (termoPesquisa = '') => {
    if (!tokenAutenticacao) return;
    setLoading(true);

    try {
      const query = termoPesquisa 
        ? `search "${termoPesquisa}"; fields name, cover.image_id, platforms.name, rating; where cover != null; limit 15;`
        : `fields name, cover.image_id, platforms.name, rating; where cover != null & rating > 80 & rating_count > 50; sort rating desc; limit 15;`;

      const resposta = await fetch(`${proxyCORS}https://api.igdb.com/v4/games`, {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${tokenAutenticacao}`,
          'Accept': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: query
      });

      const dados = await resposta.json();
      setJogos(dados);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { autenticarIGDB(); }, []);
  useEffect(() => { if (tokenAutenticacao) buscarJogos(); }, [tokenAutenticacao]);

  // FUNÇÃO NOVA DO GABRIEL: Salva no Firestore
  const handleAdicionarJogo = async (item: any) => {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) return;

    const urlCapa = item.cover?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.image_id}.jpg`
      : 'https://via.placeholder.com/150x200/151A27/7C3AED?text=Sem+Capa';
    
    const plataformaPrincipal = item.platforms && item.platforms.length > 0 ? item.platforms[0].name : 'Várias Plataformas';

    try {
      // Cria uma subcoleção "jogos" dentro do documento do usuário
      const docRef = doc(db, "usuarios", usuarioLogado.uid, "jogos", item.id.toString());
      await setDoc(docRef, {
        id: item.id.toString(),
        nome: item.name,
        capa: urlCapa,
        plataforma: plataformaPrincipal,
        status: 'Desejos', // Padrão inicial
        progresso: 0,
        adicionadoEm: new Date().toISOString()
      });
      alert(`"${item.name}" foi adicionado à sua biblioteca!`);
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      alert("Erro ao adicionar jogo.");
    }
  };

  const renderJogo = ({ item }: { item: any }) => {
    const urlCapa = item.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover.image_id}.jpg` : 'https://via.placeholder.com/150x200/151A27/7C3AED?text=Sem+Capa';
    const plataformaPrincipal = item.platforms && item.platforms.length > 0 ? item.platforms[0].name : 'Várias Plataformas';

    return (
      <View style={styles.card}>
        <Image source={{ uri: urlCapa }} style={styles.capa} />
        <View style={styles.cardInfo}>
          <Text style={styles.nomeJogo} numberOfLines={2}>{item.name}</Text>
          <View style={styles.plataformaContainer}>
            <MaterialCommunityIcons name="gamepad-variant-outline" size={14} color="#9CA3AF" />
            <Text style={styles.plataformaTexto} numberOfLines={1}>{plataformaPrincipal}</Text>
          </View>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingTexto}>{Math.round(item.rating)}/100</Text>
            </View>
          )}
          <TouchableOpacity style={styles.botaoAdicionar} onPress={() => handleAdicionarJogo(item)}>
            <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <View style={[styles.contentContainer, isWeb && styles.webContainer]}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#6B7280" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} placeholder="Buscar novos jogos..." placeholderTextColor="#6B7280"
            value={busca} onChangeText={setBusca} onSubmitEditing={() => buscarJogos(busca)} returnKeyType="search"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => { setBusca(''); buscarJogos(''); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Conectando ao banco de dados...</Text>
          </View>
        ) : (
          <FlatList data={jogos} keyExtractor={(item) => item.id.toString()} renderItem={renderJogo} contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0F19' },
  contentContainer: { flex: 1, width: '100%', alignSelf: 'center' },
  webContainer: { width: '60%', paddingHorizontal: 30, paddingTop: 40 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151A27', marginHorizontal: 20, marginBottom: 20, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#202638' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFFFFF', paddingVertical: 14, fontSize: 15 },
  listaContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#151A27', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#202638' },
  capa: { width: 100, height: 140, resizeMode: 'cover' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  nomeJogo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  plataformaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  plataformaTexto: { color: '#9CA3AF', fontSize: 12, marginLeft: 4, flexShrink: 1 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ratingTexto: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  botaoAdicionar: { flexDirection: 'row', backgroundColor: '#7C3AED', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  textoBotaoAdicionar: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginLeft: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9CA3AF', marginTop: 10, fontSize: 14 }
});