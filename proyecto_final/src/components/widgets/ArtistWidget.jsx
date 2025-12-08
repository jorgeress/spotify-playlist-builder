"use client";

import { useEffect, useState} from "react";

export default  function ArtistWidget({token, selectedItems, onSelect}){

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length > 0) fetchArtists();
    }, 400);
    return () => clearTimeout(delay);
  }, [query]);

  async function fetchArtists(){
    setLoading(true);
    const res = fetch(`/api/search?type=artist&q=${query}`)
    const data = (await res).json();
    setResults(data.artists.items);
    setLoading(false);
  }

  function toggleArtist(artist){
    onSelect(artist);
  }

  return (
    <div className="widget-artist-container">
      <input
      type="text"
      placeholder="Search artist..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      />

      <div className="results">
        {results.map((artist) => (
          <div
            key={artist.id}
            className={`artist-card ${
              selectedItems.some((a) => a.id === artist.id)
                ? "selected"
                : ""
            }`}
            onClick={() => toggleArtist(artist)}
          >
            <img src={artist.images?.[0]?.url} alt={artist.name} />
            <p>{artist.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
    