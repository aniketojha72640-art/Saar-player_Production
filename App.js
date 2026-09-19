import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [songQuery, setSongQuery] = useState('');
  const [statusText, setStatusText] = useState('Ready to play');
  const [soundObject, setSoundObject] = useState(null);

  async function searchAndPlaySong() {
    if (!songQuery) return;
    setStatusText('Searching JioSaavn...');
    try {
      const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(songQuery)}`);
      const data = await response.json();
      if (data.data.results.length > 0) {
        setStatusText('Song found! Buffering...');
        const songInfo = data.data.results[0];
        const link = songInfo.downloadUrl[songInfo.downloadUrl.length - 1].link;
        
        if (soundObject) await soundObject.unloadAsync();
        
        const { sound } = await Audio.Sound.createAsync({ uri: link });
        setSoundObject(sound);
        setStatusText(`Playing: ${songInfo.name}`);
        await sound.playAsync();
      } else {
        setStatusText('Song not found.');
      }
    } catch (error) {
      setStatusText('Error connecting to API.');
    }
  }

  async function pauseSong() {
    if (soundObject) {
      await soundObject.pauseAsync();
      setStatusText('Paused');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desi Music Player</Text>
      <TextInput style={styles.input} placeholder="Search any Hindi song..." placeholderTextColor="#888" value={songQuery} onChangeText={setSongQuery} />
      <TouchableOpacity style={styles.button} onPress={searchAndPlaySong}><Text style={styles.buttonText}>▶ Search & Play</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor: '#333'}]} onPress={pauseSong}><Text style={styles.buttonText}>⏸ Pause</Text></TouchableOpacity>
      <Text style={styles.status}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 }, title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20 }, input: { width: '100%', height: 50, backgroundColor: '#222', color: 'white', borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 }, button: { backgroundColor: '#1DB954', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 50, marginBottom: 15, width: '100%', alignItems: 'center' }, buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }, status: { color: '#1DB954', marginTop: 20, fontSize: 16 } });

