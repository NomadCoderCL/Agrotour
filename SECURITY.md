# Security Policy

## Supported Versions

Actualmente solo mantenemos la rama `main`. Todas las versiones anteriores no reciben actualizaciones de seguridad.

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ (active development) |
| < main  | ❌                 |

## Reporting a Vulnerability

Si descubres una vulnerabilidad de seguridad en Agrotour, **por favor repórtala de forma privada** para que podamos solucionarla antes de cualquier divulgación pública.

**Cómo reportar:**

1. Envía un email a: **cristian.cayun.dev@gmail.com**  
   (Si tienes PGP, usa esta clave pública: [agrega fingerprint o link si tienes])

2. Incluye la siguiente información:
   - Descripción detallada del problema
   - Pasos para reproducir (PoC si es posible)
   - Impacto potencial (e.g., data leak, RCE, pago fraudulento)
   - Versión afectada (commit SHA o tag)
   - Información del entorno (navegador, dispositivo, OS)

**Qué esperar:**

- Recibirás confirmación de recepción en ≤ 48 horas.
- Actualización de estado cada 7 días (mínimo).
- Reconocimiento público en el changelog / Hall of Fame si el reporte es válido y significativo (opcional, bajo tu consentimiento).
- No divulgaremos ni explotaremos la vulnerabilidad antes de tener un fix publicado.

**Alcance fuera de política (no aplican recompensas ni reconocimiento):**

- Ataques de denegación de servicio (DoS)
- Problemas de configuración de servidores de terceros
- Missing HTTP security headers sin impacto real
- Rate limiting bypass sin impacto crítico
- Vulnerabilidades en dependencias no mantenidas por nosotros

## Security Measures in Place

- Multi-tenancy estricto con Row-Level Security (PostgreSQL)
- Autenticación JWT con refresh tokens
- OAuth2 (Google/Facebook) + fallback email/password
- Rate limiting en endpoints críticos
- Dependabot para actualizaciones de dependencias
- Sanitización de inputs en sync engine
- Compresión y validación de imágenes subidas
- No almacenamiento de datos de tarjetas (Stripe/Khipu)
