// Region Filter Utilities - Official Surabaya Districts
// Based on official administrative boundaries

/**
 * Filter cafes by official Surabaya region
 * @param {Array} cafes - Array of cafe objects
 * @param {string} region - Region filter ('Semua', 'SBY Timur', 'SBY Selatan', 'SBY Barat', 'SBY Pusat', 'SBY Utara')
 * @returns {Array} Filtered cafes array
 */
export function filterCafesByRegion(cafes, region) {
    if (region === 'Semua' || !region) {
        return cafes;
    }
    if (region === 'Lainnya') {
        return cafes.filter(cafe => !cafe.region || cafe.region === 'Unknown');
    }
    return cafes.filter(cafe => cafe.region === region);
}

/**
 * Get cafe count by region
 * @param {Array} cafes - Array of cafe objects
 * @returns {Object} Object with region counts
 */
export function getCafeCountsByRegion(cafes) {
    const counts = {
        'Semua': cafes.length,
        'SBY Timur': 0,
        'SBY Selatan': 0,
        'SBY Barat': 0,
        'SBY Pusat': 0,
        'SBY Utara': 0,
        'Lainnya': 0
    };

    cafes.forEach(cafe => {
        const region = cafe.region;
        if (counts.hasOwnProperty(region)) {
            counts[region]++;
        } else {
            // Unknown / missing region cafes live in "Lainnya" so they stay reachable
            counts['Lainnya']++;
        }
    });

    return counts;
}

/**
 * Official Surabaya Regions Configuration
 * Based on actual administrative districts
 */
export const SURABAYA_REGIONS = [
    { 
        key: 'Semua', 
        label: 'Semua', 
        description: 'All cafes in Surabaya',
        color: '#6366f1',
        districts: []
    },
    { 
        key: 'SBY Timur', 
        label: 'SBY Timur', 
        description: 'East Surabaya - Gubeng, Rungkut, Mulyorejo, Sukolilo, etc.',
        color: '#f59e0b',
        districts: ['Gubeng', 'Gunung Anyar', 'Sukolilo', 'Tambaksari', 'Mulyorejo', 'Rungkut', 'Tenggilis Mejoyo']
    },
    { 
        key: 'SBY Selatan', 
        label: 'SBY Selatan', 
        description: 'South Surabaya - Gayungan, Wiyung, Pakuwon area, etc.',
        color: '#84cc16',
        districts: ['Wonokromo', 'Wonocolo', 'Wiyung', 'Karang Pilang', 'Jambangan', 'Gayungan', 'Dukuh Pakis', 'Sawahan']
    },
    { 
        key: 'SBY Barat', 
        label: 'SBY Barat', 
        description: 'West Surabaya - Lakarsantri, Citraland, Sambikerep, etc.',
        color: '#ef4444',
        districts: ['Benowo', 'Pakal', 'Asemrowo', 'Sukomanunggal', 'Tandes', 'Sambikerep', 'Lakarsantri']
    },
    { 
        key: 'SBY Pusat', 
        label: 'SBY Pusat', 
        description: 'Central Surabaya - Tunjungan, Genteng, Darmo, city center',
        color: '#8b5cf6',
        districts: ['Tegalsari', 'Simokerto', 'Genteng', 'Bubutan']
    },
    {
        key: 'SBY Utara',
        label: 'SBY Utara',
        description: 'North Surabaya - Kenjeran, Bulak, port area, etc.',
        color: '#06b6d4',
        districts: ['Bulak', 'Kenjeran', 'Semampir', 'Pabean Cantian', 'Krembangan']
    },
    {
        key: 'Lainnya',
        label: 'Lainnya',
        description: 'Cafe di luar wilayah resmi Surabaya atau wilayah belum terpetakan',
        color: '#94a3b8',
        districts: []
    }
];

/**
 * Get region configuration by key
 * @param {string} regionKey - Region key
 * @returns {Object} Region configuration object
 */
export function getRegionConfig(regionKey) {
    return SURABAYA_REGIONS.find(region => region.key === regionKey);
}

/**
 * Get region display name with count
 * @param {string} region - Region key
 * @param {Object} counts - Counts object from getCafeCountsByRegion
 * @returns {string} Display name with count
 */
export function getRegionDisplayName(region, counts) {
    const count = counts[region] || 0;
    return `${region} (${count})`;
}