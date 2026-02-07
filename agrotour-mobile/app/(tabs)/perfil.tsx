import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContextV2';
import { Button } from '@/components/UI';

export default function PerfilScreen() {
  const { colors } = useDarkMode();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, setThemeMode } = useDarkMode();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getRoleLabel = (rol?: string) => {
    switch (rol) {
      case 'cliente':
        return 'Cliente';
      case 'productor':
        return 'Productor';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con avatar */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.nombre}
          </Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>
            {getRoleLabel(user?.rol)}
          </Text>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Información Personal
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Email
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {user?.email}
                </Text>
              </View>
            </View>

            {user?.telefono && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Teléfono
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {user.telefono}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Rol
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {getRoleLabel(user?.rol)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferencias
          </Text>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* Dark Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.settingContent}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Modo Oscuro
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                    {isDarkMode ? 'Activado' : 'Desactivado'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  {
                    backgroundColor: isDarkMode ? colors.primary : colors.border,
                  },
                ]}
                onPress={toggleDarkMode}
              >
                <View
                  style={[
                    styles.toggleIndicator,
                    {
                      transform: [{ translateX: isDarkMode ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

            {/* Theme Mode */}
            <View style={styles.themeOptions}>
              <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                Tema
              </Text>
              <View style={styles.themeButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: '#fff',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode('light')}
                >
                  <Ionicons name="sunny" size={16} color="#FDB813" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: '#1a1a1a',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode('dark')}
                >
                  <Ionicons name="moon" size={16} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode('auto')}
                >
                  <Ionicons name="settings" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Akciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Ayuda y Soporte
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Términos y Condiciones
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Política de Privacidad
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
          />
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Agrotour v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            © 2024 Agrotour. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  settingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  settingDivider: {
    height: 1,
    marginVertical: 12,
  },
  themeOptions: {
    gap: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  themeButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 12,
  },
});
