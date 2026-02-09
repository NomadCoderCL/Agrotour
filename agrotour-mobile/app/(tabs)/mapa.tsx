import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/DataService';
import { globalErrorStore } from '@/services/GlobalErrorStore';
import { Ubicacion, Productor } from '@/shared/types';
import { LoadingSpinner, ErrorMessage, Button } from '@/components/UI';

export default function MapaScreen() {
  const { colors } = useDarkMode();
  const { user } = useAuth();

  const [productores, setProductores] = useState<Productor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<Productor | null>(null);

  useEffect(() => {
    loadProductores();
  }, []);

  const loadProductores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const producers = await dataService.getProducers();
      setProductores(producers);
    } catch (err) {
      globalErrorStore.setError('NETWORK_ERROR', 'No se pudieron cargar los productores');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGoogleMaps = (ubicacion: Ubicacion) => {
    const url = `https://maps.google.com/?q=${ubicacion.latitud},${ubicacion.longitud}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir Google Maps:', err);
    });
  };

  const handleCallProducer = (telefono: string) => {
    Linking.openURL(`tel:${telefono}`).catch((err) => {
      console.error('Error al realizar llamada:', err);
    });
  };

  const handleWhatsApp = (telefono: string) => {
    const url = `https://wa.me/${telefono}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir WhatsApp:', err);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={colors.textSecondary} />
          <Text style={[styles.mapText, { color: colors.textSecondary }]}>
            Mapa de productores
          </Text>
          <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>
            Esta funcionalidad se implementará pronto
          </Text>
        </View>
      </View>

      {/* Productores List */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={loadProductores} />}

      {!isLoading && !error && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {productores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="leaf-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay productores disponibles
              </Text>
            </View>
          ) : (
            productores.map((productor) => (
              <TouchableOpacity
                key={productor.id}
                style={[
                  styles.producerCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedProducer?.id === productor.id && {
                    borderColor: colors.primary,
                    borderWidth: 2
                  },
                ]}
                onPress={() =>
                  setSelectedProducer(
                    selectedProducer?.id === productor.id ? null : productor
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.producerHeader}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                      {productor.usuario?.nombre?.charAt(0).toUpperCase() || 'P'}
                    </Text>
                  </View>

                  <View style={styles.producerInfo}>
                    <Text
                      style={[styles.producerName, { color: colors.text }]}
                    >
                      {productor.usuario?.nombre || 'Productor'}
                    </Text>
                    {productor.ubicacion && (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location"
                          size={14}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.locationText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {productor.ubicacion.direccion || 'Ubicación no definida'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Ionicons
                    name={
                      selectedProducer?.id === productor.id
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color={colors.primary}
                  />
                </View>

                {selectedProducer?.id === productor.id && (
                  <View
                    style={[
                      styles.expandedContent,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    {productor.ubicacion && (
                      <>
                        <Button
                          title="Ver en Mapa"
                          onPress={() => handleOpenGoogleMaps(productor.ubicacion!)}
                          variant="primary"
                        />
                      </>
                    )}

                    {productor.usuario?.telefono && (
                      <View style={styles.contactContainer}>
                        <TouchableOpacity
                          style={[
                            styles.contactButton,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={() =>
                            handleCallProducer(productor.usuario!.telefono!)
                          }
                        >
                          <Ionicons name="call" size={16} color="white" />
                          <Text style={styles.contactButtonText}>Llamar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.contactButton,
                            { backgroundColor: '#25D366' },
                          ]}
                          onPress={() =>
                            handleWhatsApp(productor.usuario!.telefono!)
                          }
                        >
                          <Ionicons name="logo-whatsapp" size={16} color="white" />
                          <Text style={styles.contactButtonText}>WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {productor.usuario?.email && (
                      <View
                        style={[
                          styles.emailRow,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="mail"
                          size={16}
                          color={colors.primary}
                        />
                        <Text
                          style={[styles.emailText, { color: colors.text }]}
                        >
                          {productor.usuario.email}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 240,
    borderBottomWidth: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  producerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  producerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  producerInfo: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  emailText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
