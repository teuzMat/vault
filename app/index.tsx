import { View, Text, StyleSheet } from 'react-native';

export default function ExplorarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar</Text>
      <Text style={styles.subtitle}>Jogos em destaque via RAWG API aparecerão aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#7C3AED',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});