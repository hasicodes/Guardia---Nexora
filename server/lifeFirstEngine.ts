import { Incident, LifeFirstAssessment, PriorityLevel, InjurySeverity } from '../src/types/index.ts';

export function calculateLifeFirstAssessment(params: {
  immediateDanger: boolean;
  injurySeverity: InjurySeverity;
  medicalConditionNotes?: string;
  peopleTrapped: boolean;
  peopleAffected: number;
  peopleInjured: number;
  hasVulnerablePeople: boolean;
  isSituationEscalating: boolean;
  submittedAt?: string;
}): LifeFirstAssessment {
  const missingInformation: string[] = [];
  const urgentReasons: string[] = [];

  // 1. Immediate threat to life (Weight: 25%)
  let threatScore = 0;
  if (params.immediateDanger) {
    threatScore = 100;
    urgentReasons.push('Report indicates immediate danger to human life');
  } else {
    threatScore = 15; // baseline precaution
  }

  // 2. Injury severity (Weight: 25%)
  let injuryScore = 0;
  switch (params.injurySeverity) {
    case 'life_threatening':
      injuryScore = 100;
      urgentReasons.push('Critical life-threatening trauma reported');
      break;
    case 'serious':
      injuryScore = 75;
      break;
    case 'minor':
      injuryScore = 30;
      break;
    case 'none':
      injuryScore = 5;
      break;
    case 'unknown':
    default:
      // Critical safety logic: Unknown is never 0 risk
      injuryScore = 45;
      missingInformation.push('Injury severity is unconfirmed (precautionary baseline applied)');
      break;
  }

  // 3. Medical condition (Weight: 15%)
  let medicalScore = 10;
  if (params.medicalConditionNotes && params.medicalConditionNotes.trim().length > 0) {
    const text = params.medicalConditionNotes.toLowerCase();
    if (text.includes('unconscious') || text.includes('breathing') || text.includes('cardiac') || text.includes('bleeding')) {
      medicalScore = 100;
      urgentReasons.push(`Acute medical risk flagged: ${params.medicalConditionNotes}`);
    } else if (text.includes('fracture') || text.includes('burn') || text.includes('pain')) {
      medicalScore = 65;
    } else {
      medicalScore = 35;
    }
  } else if (params.peopleInjured > 0) {
    medicalScore = 40;
    missingInformation.push('Specific medical symptoms not detailed');
  }

  // 4. People trapped (Weight: 12%)
  let trappedScore = 0;
  if (params.peopleTrapped) {
    trappedScore = 100;
    urgentReasons.push('Individuals reported trapped under debris/flood/structure');
  } else {
    trappedScore = 5;
  }

  // 5. People affected (Weight: 10%)
  let affectedScore = 10;
  if (params.peopleAffected >= 50) {
    affectedScore = 100;
  } else if (params.peopleAffected >= 20) {
    affectedScore = 80;
  } else if (params.peopleAffected >= 5) {
    affectedScore = 50;
  } else if (params.peopleAffected >= 1) {
    affectedScore = 25;
  }

  // 6. Vulnerable individuals (Weight: 5%)
  let vulnerableScore = params.hasVulnerablePeople ? 100 : 10;

  // 7. Incident progression (Weight: 5%)
  let progressionScore = 10;
  if (params.isSituationEscalating) {
    progressionScore = 100;
    if (params.peopleAffected > 5 || params.peopleInjured > 0) {
      urgentReasons.push('Situation actively expanding or escalating in scale');
    }
  }

  // 8. Waiting time (Weight: 3%)
  let waitingScore = 10;
  if (params.submittedAt) {
    const elapsedMinutes = (Date.now() - new Date(params.submittedAt).getTime()) / (1000 * 60);
    if (elapsedMinutes > 60) waitingScore = 100;
    else if (elapsedMinutes > 30) waitingScore = 70;
    else if (elapsedMinutes > 15) waitingScore = 40;
    else waitingScore = 15;
  }

  // Calculate weighted composite score
  const cThreat = threatScore * 0.25;
  const cInjury = injuryScore * 0.25;
  const cMedical = medicalScore * 0.15;
  const cTrapped = trappedScore * 0.12;
  const cAffected = affectedScore * 0.10;
  const cVulnerable = vulnerableScore * 0.05;
  const cProgression = progressionScore * 0.05;
  const cWaiting = waitingScore * 0.03;

  const totalScore = Math.round(cThreat + cInjury + cMedical + cTrapped + cAffected + cVulnerable + cProgression + cWaiting);

  // Urgent review override check
  const urgentReviewOverride = urgentReasons.length > 0 && (
    params.immediateDanger ||
    params.injurySeverity === 'life_threatening' ||
    params.peopleTrapped ||
    (params.isSituationEscalating && params.peopleInjured > 2)
  );

  let suggestedPriority: PriorityLevel;
  if (urgentReviewOverride || totalScore >= 75) {
    suggestedPriority = 'P1';
  } else if (totalScore >= 50) {
    suggestedPriority = 'P2';
  } else if (totalScore >= 25) {
    suggestedPriority = 'P3';
  } else {
    suggestedPriority = 'P4';
  }

  return {
    score: totalScore,
    suggestedPriority,
    urgentReviewOverride,
    urgentReasons,
    factors: {
      threatToLife: { score: threatScore, weight: 25, contribution: Math.round(cThreat), label: params.immediateDanger ? 'Immediate Danger Reported' : 'Normal / Low' },
      injurySeverity: { score: injuryScore, weight: 25, contribution: Math.round(cInjury), label: params.injurySeverity.replace('_', ' ').toUpperCase() },
      medicalCondition: { score: medicalScore, weight: 15, contribution: Math.round(cMedical), label: medicalScore >= 75 ? 'Critical Symptoms' : 'Standard / Minor' },
      peopleTrapped: { score: trappedScore, weight: 12, contribution: Math.round(cTrapped), label: params.peopleTrapped ? 'Trapped Under Threat' : 'Not Trapped' },
      peopleAffected: { score: affectedScore, weight: 10, contribution: Math.round(cAffected), label: `${params.peopleAffected} People Involved` },
      vulnerableIndividuals: { score: vulnerableScore, weight: 5, contribution: Math.round(cVulnerable), label: params.hasVulnerablePeople ? 'Children/Elderly Present' : 'Standard' },
      incidentProgression: { score: progressionScore, weight: 5, contribution: Math.round(cProgression), label: params.isSituationEscalating ? 'Actively Escalating' : 'Stable' },
      waitingTime: { score: waitingScore, weight: 3, contribution: Math.round(cWaiting), label: 'Elapsed Triage Window' }
    },
    missingInformation,
    assessedAt: new Date().toISOString()
  };
}

export function evaluateDynamicReassessment(
  oldIncident: Incident,
  updatedData: Partial<Incident>
): {
  reassessed: boolean;
  escalated: boolean;
  newAssessment: LifeFirstAssessment;
  reason: string;
} {
  const merged = {
    ...oldIncident,
    ...updatedData
  };

  const newAssessment = calculateLifeFirstAssessment({
    immediateDanger: merged.immediateDanger,
    injurySeverity: merged.injurySeverity,
    medicalConditionNotes: merged.medicalConditionNotes,
    peopleTrapped: merged.peopleTrapped,
    peopleAffected: merged.peopleAffected,
    peopleInjured: merged.peopleInjured,
    hasVulnerablePeople: merged.hasVulnerablePeople,
    isSituationEscalating: merged.isSituationEscalating,
    submittedAt: merged.submittedAt
  });

  const priorityRank: Record<PriorityLevel, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
  const oldRank = priorityRank[oldIncident.finalPriority || oldIncident.suggestedPriority];
  const newRank = priorityRank[newAssessment.suggestedPriority];
  const escalated = newRank > oldRank;

  let reason = '';
  if (escalated) {
    reason = `Dynamic Priority Escalation: Priority elevated from ${oldIncident.finalPriority} to ${newAssessment.suggestedPriority} due to ${
      newAssessment.urgentReasons.join('; ') || 'higher assessed life-safety risk score'
    }`;
  } else if (newAssessment.score !== oldIncident.assessment.score) {
    reason = `Assessment score updated from ${oldIncident.assessment.score} to ${newAssessment.score}`;
  }

  return {
    reassessed: true,
    escalated,
    newAssessment,
    reason
  };
}
