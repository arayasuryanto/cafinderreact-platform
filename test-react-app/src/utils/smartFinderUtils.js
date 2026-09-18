// Smart Finder Utilities
import { cleanedCafesData } from '../data/cleanedCafesData';
import { adaptCafeDataForSinglePage, normalizeOpeningHours } from './cafeDataAdapter';

/**
 * Navigate to a cafe detail page. Uses history.pushState + a popstate event
 * so the app router loads the cafe by id (same path a back/forward takes).
 */
export const navigateToCafePage = (cafeId) => {
  if (!cafeId) return;
  window.history.pushState({}, '', `/catalog/cafe/${cafeId}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const generateAnalysis = (responses) => {
  // Define 6 personality types with scoring weights
  const personalityScores = {
    'The Productivity Hunter': 0,
    'The Social Connector': 0,
    'The Coffee Connoisseur': 0,
    'The Aesthetic Seeker': 0,
    'The Comfort Lover': 0,
    'The Night Owl': 0
  };

  // Score based on purpose
  if (responses.purpose === 'work') {
    personalityScores['The Productivity Hunter'] += 3;
    personalityScores['The Coffee Connoisseur'] += 1;
  } else if (responses.purpose === 'social') {
    personalityScores['The Social Connector'] += 3;
    personalityScores['The Aesthetic Seeker'] += 1;
  } else if (responses.purpose === 'business') {
    personalityScores['The Social Connector'] += 2;
    personalityScores['The Productivity Hunter'] += 2;
  } else if (responses.purpose === 'solo') {
    personalityScores['The Comfort Lover'] += 3;
    personalityScores['The Coffee Connoisseur'] += 2;
  }

  // Score based on time preference
  if (responses.time === 'night') {
    personalityScores['The Night Owl'] += 3;
    personalityScores['The Comfort Lover'] += 1;
  } else if (responses.time === 'morning') {
    personalityScores['The Productivity Hunter'] += 2;
    personalityScores['The Coffee Connoisseur'] += 1;
  } else if (responses.time === 'afternoon') {
    personalityScores['The Social Connector'] += 1;
    personalityScores['The Aesthetic Seeker'] += 1;
  }

  // Score based on atmosphere preference
  if (responses.atmosphere === 'quiet') {
    personalityScores['The Productivity Hunter'] += 2;
    personalityScores['The Coffee Connoisseur'] += 2;
    personalityScores['The Comfort Lover'] += 1;
  } else if (responses.atmosphere === 'bustling') {
    personalityScores['The Social Connector'] += 3;
    personalityScores['The Night Owl'] += 1;
  } else if (responses.atmosphere === 'cozy') {
    personalityScores['The Comfort Lover'] += 3;
    personalityScores['The Coffee Connoisseur'] += 1;
  } else if (responses.atmosphere === 'modern') {
    personalityScores['The Aesthetic Seeker'] += 2;
    personalityScores['The Productivity Hunter'] += 1;
  }

  // Score based on priority
  if (responses.priority === 'wifi') {
    personalityScores['The Productivity Hunter'] += 3;
    personalityScores['The Social Connector'] += 1;
  } else if (responses.priority === 'coffee') {
    personalityScores['The Coffee Connoisseur'] += 3;
    personalityScores['The Comfort Lover'] += 1;
  } else if (responses.priority === 'instagram') {
    personalityScores['The Aesthetic Seeker'] += 3;
    personalityScores['The Social Connector'] += 1;
  }

  // Score based on seating preference
  if (responses.seating === 'sofa') {
    personalityScores['The Comfort Lover'] += 2;
    personalityScores['The Night Owl'] += 1;
  } else if (responses.seating === 'outdoor') {
    personalityScores['The Aesthetic Seeker'] += 2;
    personalityScores['The Social Connector'] += 1;
  } else if (responses.seating === 'counter') {
    personalityScores['The Coffee Connoisseur'] += 2;
    personalityScores['The Social Connector'] += 1;
  } else if (responses.seating === 'table') {
    personalityScores['The Productivity Hunter'] += 2;
    personalityScores['The Social Connector'] += 1;
  }

  // Score based on vibe preference
  if (responses.vibe === 'productive') {
    personalityScores['The Productivity Hunter'] += 3;
  } else if (responses.vibe === 'creative') {
    personalityScores['The Aesthetic Seeker'] += 2;
    personalityScores['The Coffee Connoisseur'] += 1;
  } else if (responses.vibe === 'social') {
    personalityScores['The Social Connector'] += 3;
  } else if (responses.vibe === 'relaxation') {
    personalityScores['The Comfort Lover'] += 2;
    personalityScores['The Night Owl'] += 1;
  }

  // Find the personality type with highest score
  const maxScore = Math.max(...Object.values(personalityScores));

  // Handle ties by selecting the first one that matches (or add tie-breaking logic)
  let winningPersonality = Object.keys(personalityScores).find(
    key => personalityScores[key] === maxScore
  );

  // Tie-breaking logic: if multiple personalities have same score, prioritize based on response patterns
  const tiedPersonalities = Object.keys(personalityScores).filter(
    key => personalityScores[key] === maxScore
  );

  if (tiedPersonalities.length > 1) {
    // Priority order for tie-breaking
    const priorityOrder = [
      'The Productivity Hunter',
      'The Social Connector',
      'The Coffee Connoisseur',
      'The Aesthetic Seeker',
      'The Comfort Lover',
      'The Night Owl'
    ];

    winningPersonality = priorityOrder.find(personality =>
      tiedPersonalities.includes(personality)
    ) || tiedPersonalities[0];
  }

  // Ensure we have a valid personality (fallback)
  if (!winningPersonality || personalityScores[winningPersonality] === 0) {
    // If no clear winner or all scores are 0, assign based on dominant response
    if (responses.purpose === 'work') {
      winningPersonality = 'The Productivity Hunter';
    } else if (responses.purpose === 'social') {
      winningPersonality = 'The Social Connector';
    } else if (responses.priority === 'coffee') {
      winningPersonality = 'The Coffee Connoisseur';
    } else if (responses.priority === 'instagram') {
      winningPersonality = 'The Aesthetic Seeker';
    } else if (responses.time === 'night') {
      winningPersonality = 'The Night Owl';
    } else {
      winningPersonality = 'The Comfort Lover';
    }
  }

  // Generate analysis text based on winning personality
  const personalityDescriptions = {
    'The Productivity Hunter': 'Anda adalah tipe yang berorientasi pada produktivitas dan efisiensi. Anda membutuhkan lingkungan yang mendukung fokus dengan WiFi kencang dan suasana yang kondusif untuk bekerja.',
    'The Social Connector': 'Anda adalah tipe yang senang bersosialisasi dan networking. Anda menyukai suasana ramai yang energik dan tempat yang cocok untuk meeting atau hangout dengan teman.',
    'The Coffee Connoisseur': 'Anda adalah pencinta kopi sejati yang mengutamakan kualitas. Anda menyukai suasana cozy dan intimate sambil menikmati secangkir kopi berkualitas tinggi.',
    'The Aesthetic Seeker': 'Anda adalah tipe yang visual-oriented dan kreatif. Anda mencari spot foto yang menarik dengan desain interior yang unik dan Instagram-worthy.',
    'The Comfort Lover': 'Anda mengutamakan kenyamanan dan relaksasi. Anda mencari tempat untuk me-time berkualitas dengan area duduk yang empuk dan suasana yang santai.',
    'The Night Owl': 'Anda aktif di malam hari dan menyukai tempat yang buka larut dengan vibe santai dan chill. Anda cocok dengan suasana yang lebih santai dan tidak terburu-buru.'
  };

  const analysis = `${personalityDescriptions[winningPersonality]} Mari kita lihat kafe-kafe yang cocok dengan kepribadian ${winningPersonality} Anda.`;

  return analysis;
};

// Opening-hours parsing --------------------------------------------------

// Windows in 24h decimals, matching the quiz's time options
const TIME_WINDOWS = {
  morning: [7, 11],    // Pagi (7-11)
  afternoon: [11, 17], // Siang (11-17)
  evening: [17, 21],   // Sore (17-21)
  night: [21, 24]      // Malam (21+)
};

// Parse a token like "4", "7:30", "12 AM", "2 PM" into a 24h decimal.
// Narrow no-break spaces ( ) between number and AM/PM are tolerated.
const parseClockTime = (token, fallbackMeridiem, isEnd) => {
  const match = token.trim().match(/(\d{1,2})(?::(\d{2}))?\s*([ap])?\.?\s*m?/i);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
  const meridiem = (match[3] || fallbackMeridiem || '').toLowerCase();

  if (hour > 12 || !meridiem) return hour + minutes; // already 24h-style

  if (meridiem === 'a') {
    // "12 AM" as an end time means closing at midnight (24), as a start it's 0
    if (isEnd && hour === 12) return 24 + minutes;
    return (hour === 12 ? 0 : hour) + minutes;
  }
  return (hour === 12 ? 12 : hour + 12) + minutes;
};

// Parse a day's hours string ("7 AM to 3 PM, 5 to 9 PM") into [start, end] intervals.
const parseDayIntervals = (hoursString) => {
  if (!hoursString) return [];

  const s = hoursString.toLowerCase();
  if (s.includes('24 hour')) return [[0, 24]];
  if (s.includes('closed')) return [];

  return s
    .split(',')
    .map(part => {
      const toMatch = part.match(/^(.+?)\s+to\s+(.+)$/);
      if (!toMatch) return null;

      const endMeridiem = (toMatch[2].match(/([ap])\.?\s*m/i) || [])[1];
      const start = parseClockTime(toMatch[1], endMeridiem, false);
      const end = parseClockTime(toMatch[2], null, true);
      if (start == null || end == null) return null;

      let endHour = end;
      if (endHour <= start) endHour += 24; // closing past midnight
      return [start, endHour];
    })
    .filter(Boolean);
};

/**
 * Derive which parts of the day a cafe is actually open, from its real
 * openingHours. Returns {morning, afternoon, evening, night} booleans, or
 * null when the cafe has no parseable hours (no bonus is awarded then).
 */
export const getOpeningCapabilities = (rawHours) => {
  const normalized = normalizeOpeningHours(rawHours);
  const capabilities = { morning: false, afternoon: false, evening: false, night: false };
  let foundAny = false;

  normalized.forEach(({ hours }) => {
    parseDayIntervals(hours).forEach(([start, end]) => {
      foundAny = true;
      Object.keys(TIME_WINDOWS).forEach(key => {
        const [windowStart, windowEnd] = TIME_WINDOWS[key];
        if (start < windowEnd && end > windowStart) capabilities[key] = true;
      });
    });
  });

  return foundAny ? capabilities : null;
};

// Candidate pool filtering ------------------------------------------------

const NON_CAFE_CATEGORY = /ice cream|gelato|dessert|chocolate/i;

const isCandidateCafe = (cafe) => {
  if (cafe.permanentlyClosed) return false;
  const categories = cafe.categories || [];
  return !categories.some(category => NON_CAFE_CATEGORY.test(category));
};

// Mapping from the data's atmosphere labels to the quiz's atmosphere values
const ATMOSPHERE_MAP = {
  quiet: 'quiet',
  cozy: 'cozy',
  casual: 'bustling',
  trendy: 'modern'
};

export const generateRecommendations = async (responses) => {
  try {
    const allCafesRaw = cleanedCafesData.filter(isCandidateCafe);

    // Use the same data adapter that catalog pages use, plus real
    // SmartFinder-specific properties derived from the raw data
    const allCafes = allCafesRaw.map(cafe => {
      const adapted = adaptCafeDataForSinglePage(cafe);

      // Real atmosphere labels from the data (may be several, may be none)
      const atmospheres = [
        ...new Set(
          (cafe.additionalInfo?.Atmosphere || [])
            .flatMap(item => Object.keys(item).filter(key => item[key]))
            .map(label => ATMOSPHERE_MAP[label.toLowerCase()])
            .filter(Boolean)
        )
      ];

      // Real "best for" signals from the data — no defaults
      const bestFor = [];
      const popularFor = cafe.additionalInfo?.['Popular for'] || [];
      if (popularFor.some(item => item['Good for working on laptop'])) {
        bestFor.push('work');
      }
      if (popularFor.some(item => item['Solo dining'])) {
        bestFor.push('solo');
      }
      if ((cafe.additionalInfo?.Crowd || []).some(item => item['Groups'])) {
        bestFor.push('social');
      }

      const hasWifi = (adapted.features || []).some(f => /wifi/i.test(f));
      const isCoffeeFocused =
        (adapted.features || []).some(f => /great coffee/i.test(f)) ||
        (cafe.categories || []).some(c => /coffee|espresso/i.test(c));
      const isTrendy =
        atmospheres.includes('modern') ||
        (adapted.tags || []).some(tag => tag.toLowerCase().includes('trendy'));

      return {
        ...adapted,
        // Real photo straight from the source data
        imageUrl: cafe.imageUrl || null,
        images: cafe.imageUrl ? [cafe.imageUrl] : [],
        google_maps_direction: cafe.google_maps_direction,
        location: cafe.neighborhood || cafe.city || null,
        category: (cafe.categories || [])[0] || 'Cafe',
        address: cafe.address,
        atmospheres: atmospheres,
        bestFor: bestFor,
        hasWifi: hasWifi,
        isCoffeeFocused: isCoffeeFocused,
        isTrendy: isTrendy,
        openingCapabilities: getOpeningCapabilities(cafe.openingHours)
      };
    });

    // Score cafes based on user responses — only on signals that are
    // actually present in the data; missing data simply scores nothing.
    const scoredCafes = allCafes.map(cafe => {
      let score = 0;
      let matchReasons = [];

      // Purpose matching (highest weight). "business" maps onto the
      // group/social signal, the closest thing the data offers for meetings.
      const purposeForMatching = responses.purpose === 'business' ? 'social' : responses.purpose;
      if (cafe.bestFor.includes(purposeForMatching)) {
        score += 30;
        matchReasons.push('Cocok untuk ' +
          (responses.purpose === 'work' ? 'bekerja' :
           responses.purpose === 'social' ? 'hangout' :
           responses.purpose === 'business' ? 'meeting' : 'bersantai'));
      }

      // Time matching — only from real parsed opening hours
      if (cafe.openingCapabilities && cafe.openingCapabilities[responses.time]) {
        score += 15;
        matchReasons.push('Buka di waktu favorit Anda');
      }

      // Atmosphere matching (high weight)
      if (cafe.atmospheres.includes(responses.atmosphere)) {
        score += 25;
        matchReasons.push('Suasana ' +
          (responses.atmosphere === 'quiet' ? 'tenang' :
           responses.atmosphere === 'bustling' ? 'ramai' :
           responses.atmosphere === 'cozy' ? 'nyaman' : 'modern'));
      }

      // Priority matching (high weight)
      if (responses.priority === 'wifi' && cafe.hasWifi) {
        score += 25;
        matchReasons.push('Tersedia WiFi');
      } else if (responses.priority === 'coffee' && cafe.isCoffeeFocused) {
        score += 25;
        matchReasons.push('Dikenal dengan kopinya');
      } else if (responses.priority === 'instagram' && cafe.isTrendy) {
        score += 25;
        matchReasons.push('Suasana trendy, menarik untuk foto');
      }

      // Seating preference
      if (responses.seating === 'sofa' &&
         (cafe.features?.some(f => f.toLowerCase().includes('cozy')) ||
          cafe.tags?.some(tag => tag.toLowerCase().includes('cozy')))) {
        score += 10;
        matchReasons.push('Tersedia sofa nyaman');
      } else if (responses.seating === 'outdoor' &&
                cafe.features?.some(f => f.toLowerCase().includes('outdoor'))) {
        score += 10;
        matchReasons.push('Ada area outdoor');
      } else if (responses.seating === 'counter' &&
                cafe.features?.some(f => f.toLowerCase().includes('counter'))) {
        score += 10;
        matchReasons.push('Counter seating tersedia');
      }

      // Vibe matching
      if (responses.vibe === 'productive' && cafe.bestFor.includes('work')) {
        score += 15;
        matchReasons.push('Cocok untuk fokus kerja');
      } else if (responses.vibe === 'creative' && cafe.isTrendy) {
        score += 15;
        matchReasons.push('Atmosfer kreatif');
      } else if (responses.vibe === 'social' && cafe.bestFor.includes('social')) {
        score += 15;
        matchReasons.push('Cocok untuk ketemu teman');
      } else if (responses.vibe === 'relaxation' &&
                (cafe.atmospheres.includes('cozy') || cafe.atmospheres.includes('quiet'))) {
        score += 15;
        matchReasons.push('Sempurna untuk relaksasi');
      }

      // Bonus points for high ratings (real ratings only)
      const rating = parseFloat(cafe.rating);
      if (rating >= 4.5) {
        score += 10;
      } else if (rating >= 4.0) {
        score += 5;
      }

      // Ensure match reasons are unique and limited to 3
      matchReasons = [...new Set(matchReasons)].slice(0, 3);

      return {
        ...cafe,
        matchScore: score, // Internal score for sorting
        matchReasons: matchReasons
      };
    });

    // Sort by match score and return top 7
    return scoredCafes
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 7)
      .map(cafe => ({
        ...cafe,
        // Real data or null — the card hides anything missing
        description: cafe.description || null,
        features: cafe.features || [],
        tags: cafe.tags || []
      }));

  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return empty array if error occurs
    return [];
  }
};
