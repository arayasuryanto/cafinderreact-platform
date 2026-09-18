import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Map, Popup, Source, Layer, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SURABAYA_REGIONS } from '../../utils/regionFilter';
import './CafeMap.css';

// Mapbox access token
// Token comes from REACT_APP_MAPBOX_TOKEN at build time (see .env.production.local)
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

// Surabaya coordinates (lng, lat format for Mapbox)
const SURABAYA_CENTER = {
  longitude: 112.7521,
  latitude: -7.2575,
  zoom: 12
};

// Render whatever region label the shared util provides, fall back to raw value
const regionLabel = (key) => {
  const config = SURABAYA_REGIONS.find(r => r.key === key);
  return config ? config.label : key;
};

// Request a small thumbnail from googleusercontent instead of the full-size photo
const thumbUrl = (url) => {
  if (!url) return null;
  if (!url.includes('googleusercontent')) return url;
  const eq = url.lastIndexOf('=');
  const base = eq > url.lastIndexOf('/') ? url.slice(0, eq) : url;
  return `${base}=w120-h120`;
};

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNNDAgMjBIMjBDMTguOSAyMCAxOCAyMC45IDE4IDIyVjU4QzE4IDU5LjEgMTguOSA2MCAyMCA2MEg4MEM4MS4xIDYwIDgyIDU5LjEgODIgNThWMjJDODIgMjAuOSA4MS4xIDIwIDgwIDIwSDYwTDU4IDI2SDQyTDQwIDIwWiIgZmlsbD0iI0U1RTdFQiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDIiIHI9IjgiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4=';

const CafeMap = () => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortOption, setSortOption] = useState('rating-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [viewState, setViewState] = useState(SURABAYA_CENTER);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'map'
  const itemsPerPage = 30;
  const cafeListRef = useRef(null);
  const mapRef = useRef();

  useEffect(() => {
    fetch('/filtered_cafes.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Use existing coordinates from filtered_cafes.json
        const cafesWithCoords = data.filter(cafe => {
          return cafe.coordinates && Array.isArray(cafe.coordinates) && cafe.coordinates.length === 2;
        }).map(cafe => ({
          ...cafe,
          coordinates: {
            longitude: cafe.coordinates[1], // Mapbox uses lng, lat format
            latitude: cafe.coordinates[0]
          }
        }));

        setCafes(cafesWithCoords);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  // Region + name search filter, then sort — applies to BOTH the map markers and the list
  const filteredCafes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matching = cafes.filter(cafe => {
      if (selectedRegion !== 'all' && cafe.region !== selectedRegion) {
        return false;
      }
      if (query && !(cafe.name || '').toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });

    return matching.sort((a, b) => {
      if (sortOption === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '', 'id');
      }
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return sortOption === 'rating-asc' ? ratingA - ratingB : ratingB - ratingA;
    });
  }, [cafes, selectedRegion, searchQuery, sortOption]);

  // All filtered cafes as GeoJSON points so the map can cluster them
  const cafeGeoJson = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredCafes.map(cafe => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [cafe.coordinates.longitude, cafe.coordinates.latitude]
      },
      properties: { id: cafe.id }
    }))
  }), [filteredCafes]);

  const regionOptions = useMemo(() => {
    const counts = {};
    cafes.forEach(cafe => {
      counts[cafe.region] = (counts[cafe.region] || 0) + 1;
    });
    const knownKeys = SURABAYA_REGIONS
      .map(r => r.key)
      .filter(key => key !== 'Semua' && counts[key]);
    const extraKeys = Object.keys(counts).filter(
      key => !SURABAYA_REGIONS.some(r => r.key === key)
    );
    return [
      { value: 'all', label: 'Semua Wilayah', count: cafes.length },
      ...[...knownKeys, ...extraKeys].map(key => ({
        value: key,
        label: regionLabel(key),
        count: counts[key]
      }))
    ];
  }, [cafes]);

  // Pagination (list only — the map always shows every filtered cafe)
  const totalPages = Math.max(1, Math.ceil(filteredCafes.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCafes = filteredCafes.slice(startIndex, endIndex);

  const resetFilters = () => {
    setSelectedCafe(null);
    setPopupInfo(null);
  };

  // Scroll the selected cafe's card into view (also after auto page-jump from a marker click)
  useEffect(() => {
    if (!selectedCafe || !cafeListRef.current) return;
    const el = cafeListRef.current.querySelector(`[data-cafe-id="${selectedCafe.id}"]`);
    if (!el) return;
    const cardRect = el.getBoundingClientRect();
    const listRect = cafeListRef.current.getBoundingClientRect();
    const fullyVisible = cardRect.top >= listRect.top && cardRect.bottom <= listRect.bottom;
    if (!fullyVisible) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedCafe, page]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    resetFilters();
  };

  const handleCafeClick = useCallback((cafe) => {
    setSelectedCafe(cafe);
    setPopupInfo(cafe);

    // Move map to cafe location with precise coordinates
    if (cafe.coordinates) {
      setViewState({
        longitude: cafe.coordinates.longitude,
        latitude: cafe.coordinates.latitude,
        zoom: 16,
        transitionDuration: 1000
      });
    }

    // Make sure the cafe's card is on the current list page
    const allCafeIndex = filteredCafes.findIndex(c => c.id === cafe.id);
    if (allCafeIndex !== -1) {
      const targetPage = Math.floor(allCafeIndex / itemsPerPage) + 1;
      if (targetPage !== page) {
        setCurrentPage(targetPage);
      }
    }
  }, [filteredCafes, page, itemsPerPage]);

  const handleMapClick = useCallback((event) => {
    const feature = (event.features || []).find(
      f => f.layer && (f.layer.id === 'clusters' || f.layer.id === 'unclustered-point')
    );
    if (!feature) return;

    if (feature.layer.id === 'clusters') {
      const source = mapRef.current && mapRef.current.getSource('cafes');
      if (!source) return;
      const targetZoom = source.getClusterExpansionZoom(feature.properties.cluster_id);
      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom: targetZoom,
        duration: 600
      });
      return;
    }

    const cafe = filteredCafes.find(c => c.id === feature.properties.id);
    if (cafe) {
      handleCafeClick(cafe);
    }
  }, [filteredCafes, handleCafeClick]);

  const handleDirections = (cafe) => {
    const destination = encodeURIComponent(cafe.address || cafe.name || '');
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    if (cafe.placeId) {
      url += `&destination_place_id=${encodeURIComponent(cafe.placeId)}`;
    }
    window.open(url, '_blank');
  };

  const handleViewDetails = (cafe) => {
    window.location.href = `/catalog/cafe/${cafe.id}`;
  };

  if (loading) {
    return (
      <div className="cafe-map-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%'
        }}>
          <div className="loading">Memuat cafe...</div>
        </div>
      </div>
    );
  }

  if (!cafes || cafes.length === 0) {
    return (
      <div className="cafe-map-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div>{loadError ? 'Gagal memuat data cafe.' : 'Belum ada data cafe.'}</div>
          <div>Coba muat ulang halamannya ya.</div>
        </div>
      </div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="cafe-map-container">
        <div className="map-error" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div>Peta belum terkonfigurasi.</div>
          <div>Daftar cafe di bawah tetap bisa dipakai ya.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cafe-map-container">
      {/* Mobile View Toggle */}
      <div className="mobile-view-toggle">
        <button
          className={mobileView === 'list' ? 'active' : ''}
          onClick={() => setMobileView('list')}
        >
          Daftar
        </button>
        <button
          className={mobileView === 'map' ? 'active' : ''}
          onClick={() => setMobileView('map')}
        >
          Peta
        </button>
      </div>

      {/* Sidebar with cafe list */}
      <div className={`cafe-sidebar ${mobileView === 'list' ? 'show-list' : ''}`}>
        <div className="sidebar-header">
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama cafe..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              resetFilters();
            }}
          />
          <div className="filter-controls">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
                resetFilters();
              }}
              className="region-select"
              aria-label="Filter wilayah"
            >
              {regionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
              aria-label="Urutkan cafe"
            >
              <option value="rating-desc">Rating tertinggi</option>
              <option value="rating-asc">Rating terendah</option>
              <option value="name-asc">Nama A-Z</option>
            </select>
          </div>
        </div>

        <div className="cafe-list" ref={cafeListRef}>
          {paginatedCafes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Tidak ada cafe yang cocok. Coba ubah pencarian atau wilayahnya.
            </div>
          ) : (
            paginatedCafes.map((cafe, index) => (
            <div
              key={cafe.id}
              data-cafe-id={cafe.id}
              className={`cafe-card ${selectedCafe?.id === cafe.id ? 'selected' : ''}`}
              onClick={() => handleCafeClick(cafe)}
            >
              <div className="cafe-content">
                <div className="cafe-number">{startIndex + index + 1}</div>
                <div className="cafe-image">
                  {cafe.imageUrl ? (
                    <img
                      src={thumbUrl(cafe.imageUrl)}
                      alt={cafe.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM20 19H4V5H20V19Z" fill="#E5E7EB"/>
                        <path d="M11.5 12.5L8.5 16.5L5.5 12.5L3 16H21L15 8L11.5 12.5Z" fill="#E5E7EB"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="cafe-info">
                  <h3>{cafe.name}</h3>
                  <div className="rating-row">
                    <div className="rating">
                      <span className="stars">★</span>
                      <span className="rating-value">{cafe.rating}</span>
                    </div>
                    <span className="reviews">({cafe.reviewCount})</span>
                  </div>
                  <div className="cafe-meta">
                    <span>{cafe.categories?.[0] || 'Cafe'}</span>
                    <span className="dot">•</span>
                    <span>$$</span>
                    <span className="dot">•</span>
                    <span>{cafe.neighborhood || regionLabel(cafe.region)}</span>
                  </div>
                  <div className="cafe-actions">
                    <button
                      className="action-btn directions-btn"
                      onClick={(e) => { e.stopPropagation(); handleDirections(cafe); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21.71 11.29L12.71 2.29C12.32 1.9 11.68 1.9 11.29 2.29L2.29 11.29C1.9 11.68 1.9 12.32 2.29 12.71L11.29 21.71C11.68 22.1 12.32 22.1 12.71 21.71L21.71 12.71C22.1 12.32 22.1 11.68 21.71 11.29ZM7 14V10L17 10V14L13 10.5V17H11V10.5L7 14Z" fill="currentColor"/>
                      </svg>
                      Rute
                    </button>
                    <button
                      className="action-btn details-btn"
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(cafe); }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="results-info">
            {filteredCafes.length === 0
              ? 'Tidak ada hasil'
              : `Menampilkan ${startIndex + 1}-${Math.min(endIndex, filteredCafes.length)} dari ${filteredCafes.length}`}
          </div>
          <div className="page-controls">
            <button
              className="page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              ←
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`page-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <span className="page-dots">...</span>
            )}
            <button
              className="page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className={`map-wrapper ${mobileView === 'map' ? 'show-map' : ''}`}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          interactiveLayerIds={['clusters', 'unclustered-point']}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{width: '100%', height: '100%'}}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          logoPosition="bottom-right"
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* All filtered cafes, clustered */}
          <Source
            id="cafes"
            type="geojson"
            data={cafeGeoJson}
            cluster={true}
            clusterRadius={60}
            clusterMaxZoom={14}
          >
            <Layer
              id="clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': ['step', ['get', 'point_count'], '#FBD0C7', 20, '#F79B8B', 50, '#F05438'],
                'circle-radius': ['step', ['get', 'point_count'], 16, 20, 22, 50, 28],
                'circle-stroke-width': 3,
                'circle-stroke-color': '#fff'
              }}
            />
            <Layer
              id="cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 13
              }}
              paint={{ 'text-color': '#fff' }}
            />
            <Layer
              id="unclustered-point"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': '#F05438',
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
              }}
            />
            <Layer
              id="point-selected"
              type="circle"
              filter={['==', ['get', 'id'], selectedCafe ? selectedCafe.id : '']}
              paint={{
                'circle-color': '#F59E0B',
                'circle-radius': 10,
                'circle-stroke-width': 3,
                'circle-stroke-color': '#fff'
              }}
            />
          </Source>

          {/* Popup for selected cafe */}
          {popupInfo && (
            <Popup
              longitude={popupInfo.coordinates.longitude}
              latitude={popupInfo.coordinates.latitude}
              onClose={() => setPopupInfo(null)}
              closeButton={true}
              closeOnClick={false}
              offsetTop={-20}
              className="cafe-popup"
            >
              <div className="popup-content">
                <h3>{popupInfo.name}</h3>
                <div className="popup-rating">
                  <span className="stars">★ {popupInfo.rating}</span>
                  <span className="reviews">({popupInfo.reviewCount} ulasan)</span>
                </div>
                <p className="popup-address">{popupInfo.address}</p>
                <div className="popup-meta">
                  <span>{popupInfo.categories?.[0] || 'Cafe'}</span>
                  <span className="dot">•</span>
                  <span>{popupInfo.neighborhood || regionLabel(popupInfo.region)}</span>
                </div>
                <div className="popup-actions">
                  <button
                    className="popup-btn directions"
                    onClick={() => handleDirections(popupInfo)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21.71 11.29L12.71 2.29C12.32 1.9 11.68 1.9 11.29 2.29L2.29 11.29C1.9 11.68 1.9 12.32 2.29 12.71L11.29 21.71C11.68 22.1 12.32 22.1 12.71 21.71L21.71 12.71C22.1 12.32 22.1 11.68 21.71 11.29ZM7 14V10L17 10V14L13 10.5V17H11V10.5L7 14Z" fill="currentColor"/>
                    </svg>
                    Rute
                  </button>
                  <button
                    className="popup-btn details"
                    onClick={() => handleViewDetails(popupInfo)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default CafeMap;
