import { View, StyleSheet, Text, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { dataService } from '@/services/DataService';
import { mapCacheService } from '@/services/MapCacheService'; // 1. Importar el servicio de caché
import { globalErrorStore } from '@/services/GlobalErrorStore';
import { Productor } from '@/shared/types';
import { LoadingSpinner, ErrorMessage, Button } from '@/components/UI';

const INITIAL_REGION = {
  latitude: -45.5752,
  longitude: -72.0665,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

export default function MapaScreen() {
  const { colors } = useDarkMode();
  const [productores, setProductores] = useState<Productor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCaching, setIsCaching] = useState(false);

  const urlTemplate = mapCacheService.getTileTemplateForMapView(); // 2. Obtener la plantilla de URL local

  useEffect(() => {
    loadProductores();
  }, []);

  const loadProductores = async () => {
    // ... (sin cambios)
  };

  const handlePreCache = async () => {
    setIsCaching(true);
    Alert.alert("Iniciando Pre-cacheo", "Se descargarán los mapas para uso offline. Esto puede tardar varios minutos y consumir datos.");
    try {
      await mapCacheService.preCacheRegion(INITIAL_REGION.latitude, INITIAL_REGION.longitude, 8, 12, 50); // Cachear zoom 8 a 12 en un radio de 50km
      Alert.alert("Éxito", "Los mapas de la región han sido guardados para uso offline.");
    } catch (e) {
      console.error("Failed to pre-cache map tiles", e);
      Alert.alert("Error", "No se pudieron guardar los mapas.");
    } finally {
      setIsCaching(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        provider="google"
      >
        {/* 3. Añadir UrlTile para usar nuestro sistema de caché */}
        <UrlTile
          urlTemplate={urlTemplate}
          shouldReplaceGetTileUrl={true} // Forzar el uso de nuestra plantilla
          zIndex={-1} // Renderizar debajo de los marcadores
        />
        {productores.map(productor => (
          <Marker
            key={productor.id}
            coordinate={{
              latitude: productor.ubicacion!.latitud,
              longitude: productor.ubicacion!.longitud,
            }}
            title={productor.usuario?.nombre || 'Productor'}
          />
        ))}
      </MapView>

      <View style={styles.cacheButtonContainer}>
        <Button
          title={isCaching ? "Cacheando..." : "Guardar Mapa Offline"}
          onPress={handlePreCache}
          disabled={isCaching}
          variant='secondary'
        />
      </View>

      {isLoading && <View style={styles.overlay}><LoadingSpinner /></View>}
      {error && <View style={styles.overlay}><ErrorMessage message={error} onRetry={loadProductores} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  cacheButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
