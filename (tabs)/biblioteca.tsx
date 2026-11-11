import { View, Text, StyleSheet } from 'react-native';

export default function ExplorarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela Explorar (Em breve a API RAWG)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontSize: 18 }
});