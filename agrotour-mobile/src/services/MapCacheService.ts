import * as FileSystem from 'expo-file-system';

const TILE_CACHE_DIR = `${FileSystem.cacheDirectory}map_tiles`;
const TILE_URL_TEMPLATE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

interface Tile {
  x: number;
  y: number;
  z: number;
}

class MapCacheService {

  constructor() {
    this.ensureCacheDirExists();
  }

  private async ensureCacheDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
    if (!dirInfo.exists) {
      console.log('[MapCacheService] Creating tile cache directory.');
      await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true });
    }
  }

  /**
   * Devuelve la ruta local de un tile si existe, de lo contrario la URL remota.
   */
  async getTileUrl(z: number, x: number, y: number): Promise<string> {
    const localUri = `${TILE_CACHE_DIR}/${z}/${x}/${y}.png`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
      return localUri;
    }

    const remoteUrl = TILE_URL_TEMPLATE.replace('{z}', String(z))
                                     .replace('{x}', String(x))
                                     .replace('{y}', String(y));

    // Descargar en segundo plano para futuros usos (cacheo pasivo)
    this.downloadTile(remoteUrl, localUri).catch(error => {
      console.warn(`[MapCacheService] Failed to cache tile ${z}/${x}/${y}:`, error);
    });

    return remoteUrl;
  }

  private async downloadTile(remoteUrl: string, localUri: string) {
    const dir = localUri.substring(0, localUri.lastIndexOf('/'));
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    await FileSystem.downloadAsync(remoteUrl, localUri);
  }

  /**
   * Pre-cachea los tiles para una región y niveles de zoom específicos.
   * Esta es una operación intensiva y debería llamarse con cuidado.
   */
  async preCacheRegion(lat: number, lon: number, minZoom: number, maxZoom: number, radiusKm: number) {
    console.log(`[MapCacheService] Starting pre-caching for region...`);
    for (let z = minZoom; z <= maxZoom; z++) {
        const centerTile = this.getTileForCoords(lat, lon, z);
        const tilesInRadius = this.getTilesInRadius(centerTile, z, radiusKm);

        console.log(`[MapCacheService] Caching ${tilesInRadius.length} tiles for zoom level ${z}...`);
        for(const tile of tilesInRadius) {
            const remoteUrl = TILE_URL_TEMPLATE.replace('{z}', String(tile.z)).replace('{x}', String(tile.x)).replace('{y}', String(tile.y));
            const localUri = `${TILE_CACHE_DIR}/${tile.z}/${tile.x}/${tile.y}.png`;
            if(!(await FileSystem.getInfoAsync(localUri)).exists) {
                await this.downloadTile(remoteUrl, localUri);
            }
        }
    }
    console.log('[MapCacheService] Pre-caching finished.');
  }

  private getTileForCoords(lat: number, lon: number, zoom: number): Tile {
    const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y, z: zoom };
  }

  private getTilesInRadius(centerTile: Tile, zoom: number, radiusKm: number): Tile[] {
    // Estimación simple: el número de tiles a cubrir basado en el radio.
    // Una lógica más precisa requeriría proyecciones geográficas complejas.
    const tilesPerKm = Math.pow(2, zoom) / 40075; // Circunferencia de la Tierra
    const tileRadius = Math.ceil(radiusKm * tilesPerKm);

    const tiles: Tile[] = [];
    for (let i = -tileRadius; i <= tileRadius; i++) {
        for (let j = -tileRadius; j <= tileRadius; j++) {
            tiles.push({ x: centerTile.x + i, y: centerTile.y + j, z: zoom });
        }
    }
    return tiles;
  }

    getTileTemplateForMapView(): string {
        return `${TILE_CACHE_DIR}/{z}/{x}/{y}.png`;
    }
}

export const mapCacheService = new MapCacheService();
