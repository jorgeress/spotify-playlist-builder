'use client';

import { useState, useEffect, useCallback } from 'react'; 
import Header from '@/components/Header';
import PlaylistDisplay from '@/components/PlaylistDisplay';
import { generatePlaylist, getMyProfile } from '@/lib/spotify'; 
import GenreWidget from '@/components/widgets/GenreWidget'; 
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    // 1. ESTADO
    const [user, setUser] = useState(null); 
    const [preferences, setPreferences] = useState({
        artists: [],
        genres: [],
        decades: [],
        popularity: [20, 90],
    });
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true); 
    const router = useRouter();

    
    const updatePreferences = useCallback((key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value, 
        }));
    }, []);

    // 3. CARGA INICIAL DEL PERFIL (Usa getMyProfile)
    useEffect(() => {
        async function loadUser() {
            setLoading(true);
            const profile = await getMyProfile();
            if (profile) {
                setUser(profile);
            } else {
                // Manejar error o redirección si la sesión no es válida
                console.error("No se pudo cargar el perfil. Redirigiendo a login.");
                router.push('/'); 
            }
            setLoading(false);
        }
        loadUser();
    }, []);


    // 4. GENERAR PLAYLIST 
    const handleGenerate = async () => {
        if (!user || loading) return;

        setLoading(true);
        console.log("Generando Playlist con preferencias:", preferences); 
        
        const result = await generatePlaylist(preferences);
        
        setTracks(result || []);
        setLoading(false);
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mr-4"></div>
                Cargando sesión de Spotify...
            </div>
        );
    }

    if (!user && !loading) {
        return <div className="p-6 text-red-500">Error: Sesión no válida. Por favor, inicie sesión de nuevo.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Header user={user} />

            <h1 className="text-3xl font-extrabold text-green-500 mt-6 mb-8"> Construir Mi Playlist</h1>

            {/* WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <GenreWidget 
                    selectedGenres={preferences.genres} 
                    onUpdate={genres => updatePreferences('genres', genres)} 
                />
                {/* Aquí irán ArtistWidget, DecadeWidget, etc. */}
            </div>

            <button 
                onClick={handleGenerate} 
                disabled={loading || preferences.genres.length === 0} 
                className={`w-full py-3 rounded-lg text-lg font-semibold transition-colors ${
                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                {loading ? 'Generando...' : 'Generar Playlist'}
            </button>

            <div className="mt-8">
                <PlaylistDisplay tracks={tracks} />
            </div>
        </div>
    );
}