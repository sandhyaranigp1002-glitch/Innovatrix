import { AvailabilitySlot, TeachingStyle, TutorMatchRecommendation, TutorProfile, UserProfile } from '../types';

export interface MatchingCriteria {
  subject?: string;
  preferredDay?: string;
  mode?: 'all' | 'online' | 'in_person';
  teachingStyle?: TeachingStyle | 'any';
  minRating?: number;
}

export function rankTutors(
  tutors: { user: UserProfile; profile: TutorProfile; slots: AvailabilitySlot[] }[],
  criteria: MatchingCriteria
): TutorMatchRecommendation[] {
  const recommendations: TutorMatchRecommendation[] = [];

  for (const item of tutors) {
    const { user, profile, slots } = item;
    let score = 50; // Base score
    const matchReasons: string[] = [];

    // 1. Subject match
    if (criteria.subject && criteria.subject !== 'all') {
      const subjectMatch = profile.subjects.find(
        (s) => s.subject.toLowerCase() === criteria.subject?.toLowerCase()
      );
      if (subjectMatch) {
        score += 40;
        matchReasons.push(`Teaches ${subjectMatch.subject} at ${subjectMatch.skillLevel} level`);
      } else {
        // If specific subject requested and not taught, penalize or skip
        score -= 50;
      }
    } else {
      score += 10;
      matchReasons.push(`Versatile mentor covering ${profile.subjects.map((s) => s.subject).slice(0, 3).join(', ')}`);
    }

    // 2. Mode match
    if (criteria.mode && criteria.mode !== 'all') {
      if (profile.teachingModes.includes(criteria.mode)) {
        score += 20;
        matchReasons.push(`Offers ${criteria.mode === 'online' ? 'remote virtual' : 'on-campus in-person'} sessions`);
      } else {
        score -= 25;
      }
    }

    // 3. Teaching style match
    if (criteria.teachingStyle && criteria.teachingStyle !== 'any') {
      if (profile.teachingStyle === criteria.teachingStyle) {
        score += 25;
        const styleLabel =
          profile.teachingStyle === 'beginner_friendly'
            ? 'beginner-friendly explanations'
            : profile.teachingStyle === 'practice_focused'
            ? 'hands-on practice'
            : profile.teachingStyle === 'exam_prep'
            ? 'exam-focused review'
            : 'deep technical dives';
        matchReasons.push(`Specializes in ${styleLabel}`);
      }
    }

    // 4. Availability match
    const availableSlots = slots.filter((s) => !s.isBooked);
    if (criteria.preferredDay && criteria.preferredDay !== 'any') {
      const daySlots = availableSlots.filter(
        (s) => s.dayOfWeek.toLowerCase() === criteria.preferredDay?.toLowerCase()
      );
      if (daySlots.length > 0) {
        score += 20;
        matchReasons.push(`Has open slots on ${criteria.preferredDay}`);
      }
    } else if (availableSlots.length > 0) {
      score += 10;
      matchReasons.push(`${availableSlots.length} open slots ready to book`);
    }

    // 5. Rating & Experience booster
    if (profile.rating >= 4.8) {
      score += 15;
      matchReasons.push(`Consistently rated ★${profile.rating.toFixed(1)} by university peers`);
    } else if (profile.rating >= 4.5) {
      score += 10;
    }

    if (profile.reviewCount >= 10) {
      score += 5;
    }

    // Filter by minRating if specified
    if (criteria.minRating && profile.rating < criteria.minRating) {
      continue;
    }

    // Ensure score is bounded
    const finalScore = Math.max(10, Math.min(100, score));

    recommendations.push({
      tutor: user,
      tutorProfile: profile,
      score: finalScore,
      matchReasons,
      availableSlots,
    });
  }

  // Sort descending by match score
  return recommendations.sort((a, b) => b.score - a.score);
}
