import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import rawData from '../data/salespoints.json'
import territoriesData from '../data/territories.json'

export default function MapView({ token, collapsed, filters, onStatsUpdate, onPointSelect, onTerritoryHover, onTokenError }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hoveredTerritoryRef = useRef(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const getFilteredData = useCallback((f) => {
    let features = rawData.features
    if (f.search) {
      const q = f.search.toLowerCase()
      features = features.filter(ft => ft.properties.name.toLowerCase().includes(q))
    }
    if (f.region !== 'all') features = features.filter(ft => ft.properties.region === f.region)
    if (f.status !== 'all') features = features.filter(ft => ft.properties.status === f.status)
    if (f.minScore > 0) features = features.filter(ft => ft.properties.performance_score >= f.minScore)
    return { ...rawData, features }
  }, [])

  const updateStats = useCallback((map) => {
    if (!map || !map.getSource('salespoints')) return
    
    // Query both clusters and unclustered points
    const features = map.queryRenderedFeatures({ 
      layers: ['clusters', 'unclustered-point'] 
    })
    
    let total = 0
    let active = 0
    
    features.forEach(f => {
      if (f.layer.id === 'clusters') {
        total += f.properties.point_count || 0
        // Cluster properties in this app have active_count (defined in source clusterProperties)
        active += f.properties.active_count || 0
      } else {
        total += 1
        if (f.properties.status === 'active') active += 1
      }
    })
    
    onStatsUpdate({ total, active })
  }, [onStatsUpdate])

  useEffect(() => {
    if (mapRef.current || !token) return
    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [80.27, 13.0],
      zoom: 10,
      antialias: true,
    })
    mapRef.current = map

    map.on('error', (e) => {
      console.error('Mapbox error:', e)
      if (e.error?.status === 401 || e.error?.message?.includes('Unauthorized')) {
        onTokenError()
      }
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right')

    map.on('load', () => {
      const initialData = getFilteredData(filtersRef.current)

      // ── TERRITORIES ───────────────────────────────────────────────
      map.addSource('territories', { type: 'geojson', data: territoriesData, generateId: true })

      map.addLayer({
        id: 'territory-fill', type: 'fill', source: 'territories',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.22, 0.07],
        },
      })

      map.addLayer({
        id: 'territory-border', type: 'line', source: 'territories',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.5, 1],
          'line-opacity': 0.6,
          'line-dasharray': [4, 2],
        },
      })

      map.addLayer({
        id: 'territory-label', type: 'symbol', source: 'territories',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12, 'text-letter-spacing': 0.12,
        },
        paint: {
          'text-color': ['get', 'color'], 'text-opacity': 0.85,
          'text-halo-color': '#0a0c10', 'text-halo-width': 2,
        },
      })

      // ── SALESPOINTS ───────────────────────────────────────────────
      map.addSource('salespoints', {
        type: 'geojson', data: initialData,
        cluster: true, clusterRadius: 50, clusterMaxZoom: 14,
        clusterProperties: {
          active_count: ['+', ['case', ['==', ['get', 'status'], 'active'], 1, 0]],
        },
      })

      // Cluster glow
      map.addLayer({
        id: 'clusters-glow', type: 'circle', source: 'salespoints',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#3b82f6', 20, '#f59e0b', 100, '#ef4444'],
          'circle-radius': ['step', ['get', 'point_count'], 24, 20, 32, 100, 44],
          'circle-opacity': 0.1,
        },
      })

      // Cluster circle
      map.addLayer({
        id: 'clusters', type: 'circle', source: 'salespoints',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#2563eb', 20, '#d97706', 100, '#dc2626'],
          'circle-radius': ['step', ['get', 'point_count'], 16, 20, 22, 100, 30],
          'circle-opacity': 1,
          'circle-stroke-width': 1, 'circle-stroke-color': '#0f172a',
        },
      })

      // Cluster count label
      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: 'salespoints',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Point glow
      map.addLayer({
        id: 'unclustered-point-glow', type: 'circle', source: 'salespoints',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['interpolate', ['linear'], ['get', 'performance_score'], 0, '#ef4444', 40, '#f59e0b', 70, '#10b981'],
          'circle-radius': 12, 'circle-opacity': 0.08,
        },
      })

      // Point
      map.addLayer({
        id: 'unclustered-point', type: 'circle', source: 'salespoints',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['interpolate', ['linear'], ['get', 'performance_score'], 0, '#dc2626', 40, '#d97706', 70, '#059669'],
          'circle-radius': ['interpolate', ['linear'], ['get', 'performance_score'], 0, 4, 100, 7],
          'circle-stroke-width': 1, 'circle-stroke-color': '#0f172a', 'circle-opacity': 1,
        },
      })

      // ── INTERACTIONS ──────────────────────────────────────────────

      map.on('click', 'clusters', (e) => {
        const [feat] = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        map.getSource('salespoints').getClusterExpansionZoom(feat.properties.cluster_id, (err, zoom) => {
          if (!err) map.easeTo({ center: feat.geometry.coordinates, zoom: zoom + 0.5, duration: 600 })
        })
      })

      map.on('click', 'unclustered-point', (e) => {
        onPointSelect(e.features[0].properties)
        map.easeTo({ center: e.features[0].geometry.coordinates, duration: 400, offset: [100, 0] })
      })

      map.on('click', (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'] })
        if (!hits.length) onPointSelect(null)
      })

      ;['clusters', 'unclustered-point'].forEach(layer => {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
      })

      map.on('mousemove', 'territory-fill', (e) => {
        if (!e.features.length) return
        const feat = e.features[0]
        if (hoveredTerritoryRef.current !== null && hoveredTerritoryRef.current !== feat.id) {
          map.setFeatureState({ source: 'territories', id: hoveredTerritoryRef.current }, { hover: false })
        }
        hoveredTerritoryRef.current = feat.id
        map.setFeatureState({ source: 'territories', id: feat.id }, { hover: true })
        map.getCanvas().style.cursor = 'crosshair'
        onTerritoryHover({ props: feat.properties, position: e.point })
      })

      map.on('mouseleave', 'territory-fill', () => {
        if (hoveredTerritoryRef.current !== null) {
          map.setFeatureState({ source: 'territories', id: hoveredTerritoryRef.current }, { hover: false })
        }
        hoveredTerritoryRef.current = null
        map.getCanvas().style.cursor = ''
        onTerritoryHover(null)
      })

      map.on('moveend', () => { if (map.loaded()) updateStats(map) })
    })

    // Automatic Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize()
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => { 
      resizeObserver.disconnect();
      map.remove(); 
      mapRef.current = null 
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update source when filters change (includes search — re-clusters automatically)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getSource('salespoints')) return
    map.getSource('salespoints').setData(getFilteredData(filters))
  }, [filters, getFilteredData])

  return <div ref={containerRef} className="w-full h-full" />
}
