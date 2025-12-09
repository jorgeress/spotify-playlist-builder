
import { getAccessToken, refreshAccessToken, logout } from './auth';


async function spotifyRequest(endpoint, method = 'GET', body = null) {
  let token = getAccessToken();
  
  const baseUrl = 'https://api.spotify.com/v1'; 
  const fetchUrl = `${baseUrl}${endpoint}`; 
  
  // Intentar refrescar si getAccessToken devolvió null
  if (!token) {
    console.log("Token expirado antes de la llamada. Intentando refrescar...");
    token = await refreshAccessToken();
    if (!token) {
        return null;
    }
  }

  let headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  // 1. Primera Petición
  let response = await fetch(fetchUrl, options);

  // Manejo de Error 401: Token Expirado o Inválido (durante la petición)
  if (response.status === 401) {
    console.log("Error 401 en la petición. Re-intentando con nuevo token...");
    
    const newToken = await refreshAccessToken(); 

    if (newToken) {
      // Reintentar la solicitud con el token recién obtenido
      options.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(fetchUrl, options); 
    } else {
      
      return null;
    }
  }

  if (!response.ok) {
    console.error(`Error en Spotify API: ${response.status} - ${response.statusText}`);
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response;
}


// Obtener el perfil
export async function getMyProfile() {
    const endpoint = '/me'; 
    return await spotifyRequest(endpoint);
}

// Busqueda con la api
export async function searchSpotify(query, type, limit = 10) {
    const endpoint = `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`; 
    const data = await spotifyRequest(endpoint);
    return data ? data[`${type}s`] : null; 
}

export async function generatePlaylist(preferences) {
  const { artists, genres, decades, popularity } = preferences;
  let allTracks = [];

  // 1. Obtener top tracks de artistas seleccionados
  for (const artist of artists) {
    const data = await spotifyRequest(
      `/artists/${artist.id}/top-tracks?market=US` // Endpoint corregido
    );
    if (data && data.tracks) {
      allTracks.push(...data.tracks);
    }
  }

  // 2. Buscar por géneros
  for (const genre of genres) {
    const data = await spotifyRequest(
      `/search?q=genre:"${genre}"&type=track&limit=20` // Endpoint corregido
    );
    if (data && data.tracks && data.tracks.items) {
      allTracks.push(...data.tracks.items);
    }
  }

  // 3. Filtrar por década
  if (decades.length > 0) {
    allTracks = allTracks.filter(track => {
      const year = new Date(track.album.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
  }

  // 4. Filtrar por popularidad
  if (popularity) {
    const [min, max] = popularity;
    allTracks = allTracks.filter(
      track => track.popularity >= min && track.popularity <= max
    );
  }

  // 5. Eliminar duplicados y limitar a 30 canciones
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  ).slice(0, 30);

  return uniqueTracks;
}