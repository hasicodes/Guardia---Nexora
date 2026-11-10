import { Incident, ResponseTeam, TeamRecommendation, ResponseCategory } from '../src/types/index.ts';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

// Map emergency category to required primary response category
export function mapRequiredResponseCategory(incident: Incident): ResponseCategory {
  switch (incident.category) {
    case 'fire':
      return 'fire_rescue';
    case 'road_accident':
      return incident.peopleTrapped ? 'search_and_rescue' : 'medical_ambulance';
    case 'medical':
      return 'medical_ambulance';
    case 'flood':
      return 'search_and_rescue';
    case 'building_collapse':
      return 'search_and_rescue';
    case 'other':
    default:
      return 'police';
  }
}

// Generate intermediate road route waypoints between two coordinates
export function generateRouteCoordinates(
  fromLat: number, 
  fromLng: number, 
  toLat: number, 
  toLng: number, 
  steps = 8
): [number, number][] {
  const coords: [number, number][] = [];
  coords.push([fromLat, fromLng]);

  // Introduce slight realistic road curvature
  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    const interpLat = fromLat + (toLat - fromLat) * fraction;
    const interpLng = fromLng + (toLng - fromLng) * fraction;
    // Add tiny deterministic road curve offset
    const curveOffset = Math.sin(fraction * Math.PI) * 0.003 * (i % 2 === 0 ? 1 : -1);
    coords.push([
      parseFloat((interpLat + curveOffset).toFixed(5)),
      parseFloat((interpLng + curveOffset).toFixed(5))
    ]);
  }

  coords.push([toLat, toLng]);
  return coords;
}

export function recommendBestResponseTeam(
  incident: Incident, 
  teams: ResponseTeam[]
): TeamRecommendation | null {
  const targetCategory = mapRequiredResponseCategory(incident);

  // Filter eligible teams: exclude unavailable or incompatible teams
  const eligible = teams.filter(t => {
    // Team must be available or returning
    const isAvailable = t.status === 'available' || t.status === 'returning';
    if (!isAvailable) return false;

    // Smart assignment innovation: Category capability check
    const matchesCategory = 
      t.category === targetCategory || 
      t.category === 'disaster_response' ||
      (targetCategory === 'search_and_rescue' && t.category === 'fire_rescue');

    return matchesCategory;
  });

  if (eligible.length === 0) {
    // If no exact category match, fallback to any available emergency team with capability
    const fallback = teams.filter(t => t.status === 'available');
    if (fallback.length === 0) return null;
    eligible.push(...fallback);
  }

  // Calculate scores based on: Distance, Travel Time, Category Match, Equipment, Priority Clearance
  const scoredTeams = eligible.map(team => {
    const distanceKm = getHaversineDistanceKm(team.latitude, team.longitude, incident.latitude, incident.longitude);
    
    // Effective speed with emergency sirens (P1 gets faster corridor clearance)
    let speed = team.speedKmh || 45;
    if (incident.finalPriority === 'P1') speed += 15;
    else if (incident.finalPriority === 'P2') speed += 8;

    const travelTimeHours = distanceKm / speed;
    const etaMinutes = Math.max(1, Math.round(travelTimeHours * 60 + 2)); // +2 min dispatch lag

    // Suitability scoring (0 - 100)
    let suitability = 100;

    // Distance penalty (lose 2 pts per km)
    suitability -= Math.min(50, distanceKm * 2);

    // Category exactness bonus
    if (team.category === targetCategory) {
      suitability += 15;
    } else {
      suitability -= 10;
    }

    // Equipment capability bonus
    if (incident.peopleTrapped && team.equipment.some(e => e.toLowerCase().includes('extrication') || e.toLowerCase().includes('cutter') || e.toLowerCase().includes('hydraulic'))) {
      suitability += 15;
    }

    if (incident.injurySeverity === 'life_threatening' && team.equipment.some(e => e.toLowerCase().includes('als') || e.toLowerCase().includes('defibrillator') || e.toLowerCase().includes('ventilator'))) {
      suitability += 15;
    }

    suitability = Math.max(10, Math.min(100, Math.round(suitability)));

    let reason = '';
    if (team.category === targetCategory) {
      reason = `Primary ${team.category.replace('_', ' ').toUpperCase()} unit with closest proximity (${distanceKm} km, ETA ${etaMinutes} mins).`;
    } else {
      reason = `Secondary unit with multi-hazard capability (${team.category.replace('_', ' ')}) located ${distanceKm} km away.`;
    }

    if (incident.peopleTrapped && team.capabilities.includes('Heavy Extrication')) {
      reason += ' Equipped with certified hydraulic extrication tools.';
    }

    return {
      team,
      distanceKm,
      etaMinutes,
      suitabilityScore: suitability,
      suitabilityReason: reason
    };
  });

  // Sort by highest suitability score
  scoredTeams.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const best = scoredTeams[0];
  const alternatives = scoredTeams.slice(1, 4).map(s => ({
    team: s.team,
    distanceKm: s.distanceKm,
    etaMinutes: s.etaMinutes,
    suitabilityReason: s.suitabilityReason
  }));

  const routeCoordinates = generateRouteCoordinates(
    best.team.latitude, 
    best.team.longitude, 
    incident.latitude, 
    incident.longitude
  );

  return {
    team: best.team,
    distanceKm: best.distanceKm,
    etaMinutes: best.etaMinutes,
    suitabilityScore: best.suitabilityScore,
    suitabilityReason: best.suitabilityReason,
    routeCoordinates,
    alternativeTeams: alternatives
  };
}
