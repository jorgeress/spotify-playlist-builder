'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toggleFavorite, isTrackFavorite } from '@/lib/favorites'; 

export default function TrackCard({ track, onRemove }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    
    useEffect(() => {
        setIsFavorite(isTrackFavorite(track.id));
    }, [track.id]);

    
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Lógica para manejar el Preview (Play/Pause)
    const handlePreviewToggle = () => {
        if (!track.preview_url) {
            alert("No hay preview disponible para esta canción.");
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Inicializar el objeto Audio si aún no existe o si se reinicia
            if (!audioRef.current) {
                audioRef.current = new Audio(track.preview_url);
                audioRef.current.onended = () => setIsPlaying(false);
            } else {
                audioRef.current.currentTime = 0; // Reiniciar
            }

            audioRef.current.play().catch(error => {
                console.error("Error al intentar reproducir audio:", error);
                alert("Error de reproducción. Asegúrate de que el navegador lo permita.");
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    };
    
    const handleToggleFavorite = () => {
        toggleFavorite(track);
        setIsFavorite(isTrackFavorite(track.id));
    };

    const formatDuration = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors mb-2">
            <div className="flex items-center space-x-4 flex-grow min-w-0">
                
                {track.album?.images?.[0] && (
                    <img 
                        src={track.album.images[0].url} 
                        alt={`Portada de ${track.name}`} 
                        className="w-12 h-12 object-cover rounded shadow-md" 
                    />
                )}
                
                
                <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-white font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                        {track.artists.map(a => a.name).join(', ')} - {track.album.name}
                    </p>
                </div>
            </div>

            
            <p className="text-sm text-gray-400 mx-4 flex-shrink-0">
                {formatDuration(track.duration_ms)}
            </p>

            
            <div className="flex space-x-3 flex-shrink-0">
                
                <button
                    onClick={handlePreviewToggle}
                    
                    className={`p-1 text-2xl transition-colors hover:scale-110
                        ${isPlaying 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        } 
                        `}
                    title={
                        !track.preview_url 
                        ? "Preview no disponible" 
                        : isPlaying ? "Pausar Preview" : "Reproducir Preview (30s)"
                    }
                    aria-label={
                        !track.preview_url 
                        ? "Preview no disponible"
                        : isPlaying ? "Pausar Preview" : "Reproducir Preview"
                    }
                >
                    {!track.preview_url ? '🔇' : (isPlaying ? '⏸️' : '▶️')}
                </button>


                <button 
                    onClick={handleToggleFavorite}
                    className="p-1 text-2xl transition-transform hover:scale-110" 
                    aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                >
                    {isFavorite ? '❤️' : '♡'} 
                </button>

                
                <button 
                    onClick={() => onRemove(track.id)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                    aria-label="Eliminar canción de la playlist"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}