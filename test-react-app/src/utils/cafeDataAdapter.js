/**
 * This utility file adapts data from the cafes_preview.json format 
 * to the format expected by our React components
 */

/**
 * Transform a cafe entry from cafes_preview.json format to SingleCafePage format
 * @param {Object} cafeData - Raw cafe data from cafes_preview.json
 * @returns {Object} - Transformed cafe data for use in SimpleCafePage
 */
export const adaptCafeDataForSinglePage = (cafeData) => {
  if (!cafeData) return null;

  // Extract features from additionalInfo
  const features = extractFeatures(cafeData.additionalInfo);

  // No dummy reviews - use empty array
  const reviews = [];

  // Only real images: the cafe's own photo when we have one, otherwise none
  const images = generateImages(cafeData);

  return {
    id: cafeData.id,
    name: cafeData.name,
    fullAddress: cafeData.address,
    google_maps_direction: cafeData.google_maps_direction, // Preserve the original google_maps_direction field
    coordinates: {
      lat: Array.isArray(cafeData.coordinates) ? cafeData.coordinates[0] : null,
      lng: Array.isArray(cafeData.coordinates) ? cafeData.coordinates[1] : null
    },
    phone: cafeData.phone,
    website: cafeData.website,
    contactInfo: {
      phone: cafeData.phone,
      email: null,
      website: cafeData.website,
      socialMedia: {
        instagram: cafeData.website && cafeData.website.includes('instagram.com') ? cafeData.website : null,
        facebook: cafeData.website && cafeData.website.includes('facebook.com') ? cafeData.website : null
      }
    },
    rating: cafeData.rating != null ? parseFloat(cafeData.rating) : null,
    totalReviews: cafeData.reviewCount != null ? Number(cafeData.reviewCount) : null,
    priceRange: null, // Not present in the source data
    images: images,
    tags: extractTags(cafeData),
    description: generateDescription(cafeData),
    aboutDetails: generateAboutDetails(cafeData),
    features: features,
    openingHours: normalizeOpeningHours(cafeData.openingHours),
    ratings: {
      overall: cafeData.rating != null ? parseFloat(cafeData.rating) : null,
      categories: null // Per-category ratings are not present in the source data
    },
    reviews: reviews,
    nearbyAttractions: [],
    popularTimes: null // Not present in the source data
  };
};

/**
 * Normalize raw openingHours into a flat [{day, hours}] array of strings.
 * Handles the nested {day, hours:{day, hours}} shape, flat {day, hours},
 * plain string entries and missing/empty input.
 */
export const normalizeOpeningHours = (rawHours) => {
  if (!Array.isArray(rawHours)) return [];

  return rawHours
    .map(entry => {
      if (typeof entry === 'string') return { day: null, hours: entry };
      if (!entry || typeof entry !== 'object') return null;
      let hours = entry.hours;
      // Nested shape: {day:"Monday", hours:{day:"Monday", hours:"4 PM to 10 PM"}}
      if (hours && typeof hours === 'object') {
        hours = hours.hours;
      }
      return {
        day: entry.day || (hours && typeof hours === 'object' ? hours.day : null),
        hours: typeof hours === 'string' ? hours : null
      };
    })
    .filter(entry => entry && entry.hours);
};

/**
 * Extract features from additionalInfo object
 */
const extractFeatures = (additionalInfo) => {
  if (!additionalInfo) return [];
  
  const features = [];
  
  // Map common categories to collect features
  const categoryMappings = {
    "Service options": (item) => Object.keys(item).filter(key => item[key]),
    "Highlights": (item) => Object.keys(item).filter(key => item[key]),
    "Offerings": (item) => Object.keys(item).filter(key => item[key]),
    "Atmosphere": (item) => Object.keys(item).filter(key => item[key])
  };
  
  // Process each category in additionalInfo
  Object.keys(additionalInfo).forEach(category => {
    if (categoryMappings[category]) {
      additionalInfo[category].forEach(item => {
        features.push(...categoryMappings[category](item));
      });
    }
  });

  return [...new Set(features)]; // Remove duplicates — real data only, nothing force-added
};





/**
 * Build the image list from real data only: the cafe's own photo when we
 * have one, otherwise an empty array (UI shows a placeholder).
 */
const generateImages = (cafeData) => {
  if (!cafeData || !cafeData.imageUrl) return [];

  return [
    {
      id: 1,
      url: cafeData.imageUrl,
      caption: "Foto utama"
    }
  ];
};

/**
 * Extract tags from cafe data categories and additionalInfo
 */
const extractTags = (cafeData) => {
  const tags = [...(cafeData.categories || [])];
  
  if (cafeData.additionalInfo) {
    // Add atmosphere tags
    if (cafeData.additionalInfo.Atmosphere) {
      cafeData.additionalInfo.Atmosphere.forEach(item => {
        tags.push(...Object.keys(item).filter(key => item[key]));
      });
    }
    
    // Add popular for tags
    if (cafeData.additionalInfo["Popular for"]) {
      cafeData.additionalInfo["Popular for"].forEach(item => {
        if (item["Good for working on laptop"]) {
          tags.push("Working Space");
        }
        Object.keys(item).filter(key => item[key]).forEach(tag => {
          tags.push(tag);
        });
      });
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
};

/**
 * Generate a description for the cafe
 */
const generateDescription = (cafeData) => {
  if (cafeData.description) return cafeData.description;
  
  return `${cafeData.name} adalah kafe yang terletak di ${cafeData.neighborhood || cafeData.city || "Surabaya"}. 
  Kafe ini menawarkan pengalaman menikmati kopi berkualitas dalam suasana yang ${getAtmosphereDescription(cafeData)}. 
  ${cafeData.categories?.includes("Coffee shop") ? "Dikenal dengan kopi spesialitasnya, " : ""}
  ${cafeData.name} menjadi tempat favorit bagi ${getTargetAudience(cafeData)} 
  yang mencari tempat ideal untuk ${getMainActivities(cafeData)}.`;
};

/**
 * Get atmosphere description based on additional info
 */
const getAtmosphereDescription = (cafeData) => {
  if (!cafeData.additionalInfo?.Atmosphere) return "nyaman dan modern";
  
  const atmosphereWords = [];
  cafeData.additionalInfo.Atmosphere.forEach(item => {
    Object.keys(item).filter(key => item[key]).forEach(atmosphere => {
      atmosphereWords.push(atmosphere.toLowerCase());
    });
  });
  
  if (atmosphereWords.length === 0) return "nyaman dan modern";
  if (atmosphereWords.length === 1) return `${atmosphereWords[0]} dan nyaman`;
  
  return atmosphereWords.slice(0, 2).join(" dan ");
};

/**
 * Get target audience description
 */
const getTargetAudience = (cafeData) => {
  if (!cafeData.additionalInfo?.Crowd) return "para pecinta kopi dan pekerja remote";
  
  const audienceWords = [];
  cafeData.additionalInfo.Crowd.forEach(item => {
    Object.keys(item).filter(key => item[key]).forEach(crowd => {
      audienceWords.push(crowd);
    });
  });
  
  if (audienceWords.length === 0) return "para pecinta kopi dan pekerja remote";
  if (audienceWords.includes("College students")) return "mahasiswa dan pekerja remote";
  if (audienceWords.includes("Groups")) return "grup teman atau keluarga";
  
  return "para pecinta kopi dan pekerja remote";
};

/**
 * Get main activities based on cafe's popular for info
 */
const getMainActivities = (cafeData) => {
  if (!cafeData.additionalInfo?.["Popular for"]) return "bekerja atau bertemu dengan teman";
  
  const activities = [];
  cafeData.additionalInfo["Popular for"].forEach(item => {
    if (item["Good for working on laptop"]) {
      activities.push("bekerja remote");
    }
    if (item["Solo dining"]) {
      activities.push("menikmati waktu sendiri");
    }
    if (item["Dinner"] || item["Lunch"]) {
      activities.push("makan bersama teman");
    }
  });
  
  if (activities.length === 0) return "bekerja atau bertemu dengan teman";
  if (activities.length === 1) return activities[0];
  
  return `${activities[0]} atau ${activities[1]}`;
};

/**
 * Generate additional about details
 */
const generateAboutDetails = (cafeData) => {
  return [
    `${cafeData.name} ${cafeData.categories?.includes("Coffee shop") ? 
      "menyajikan berbagai jenis kopi specialty dari biji pilihan yang di-roasting dengan sempurna." : 
      "menawarkan berbagai menu minuman dan makanan yang menggugah selera."} 
      ${getAtmosphereDescription(cafeData).includes("modern") ? 
        "Kafe ini memiliki interior modern dengan pencahayaan yang baik" : 
        "Suasana kafe sangat nyaman dan cozy"}, 
      ${cafeData.additionalInfo?.["Popular for"]?.some(item => item["Good for working on laptop"]) ? 
        "ideal untuk bekerja atau meeting." : 
        "ideal untuk bersantai dan berkumpul dengan teman."}`,
    
    `${cafeData.additionalInfo?.Offerings?.some(item => Object.keys(item).some(key => key.includes("food") || key.includes("bite"))) ?
      "Selain kopi, kafe ini juga menawarkan berbagai pilihan pastry, cake, dan makanan ringan." :
      "Menu minuman di kafe ini sangat beragam dan diolah dengan bahan-bahan berkualitas."} 
      ${cafeData.additionalInfo?.["Popular for"]?.some(item => item["Good for working on laptop"]) ?
        "Kafe ini tercatat sebagai tempat yang cocok untuk bekerja dengan laptop." :
        "Tempatnya yang nyaman menjadikan kafe ini pilihan ideal untuk bersantai atau berkumpul dengan teman-teman."}`
  ];
};