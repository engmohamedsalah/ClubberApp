import { Match, MatchStatus, MatchAvailability } from '../../models/match.model';

/**
 * DTO interface that matches the exact structure from the backend
 * Keep this aligned with the backend MatchDto
 */
export interface MatchDto {
  id: string;
  title: string;
  competition: string;
  date: string; // ISO date string from the backend
  status: string; // String enum from backend
  availability: string; // String enum from backend
  streamURL: string | null;
  thumbnail?: string; // Added thumbnail property from backend DTO
  location?: string; // Added location from backend DTO
}

/**
 * Helper functions for mapping enums outside the class context
 */
export function mapMatchStatus(status: string | undefined | null): MatchStatus {
  if (!status) {
    return MatchStatus.Upcoming; // Default if status is undefined or null
  }

  switch (status) {
    case 'Upcoming': return MatchStatus.Upcoming;
    case 'Live': return MatchStatus.Live;
    case 'OnDemand': return MatchStatus.OnDemand;
    case 'Canceled': return MatchStatus.Canceled;
    default: return MatchStatus.Upcoming; // Default value as fallback
  }
}

export function mapMatchAvailability(availability: string | undefined | null): MatchAvailability {
  if (!availability) {
    return MatchAvailability.Unavailable; // Default if availability is undefined or null
  }

  switch (availability) {
    case 'Available': return MatchAvailability.Available;
    case 'Unavailable': return MatchAvailability.Unavailable;
    default: return MatchAvailability.Unavailable; // Default value as fallback
  }
}

/**
 * Adapter to convert between backend DTOs and frontend models
 * Ensures consistent data transformation and validation
 */
export class MatchAdapter {
  /**
   * Convert from backend DTO to frontend model
   * @param dto - The data transfer object from the backend
   * @returns - A frontend Match model with properly formatted data
   */
  static fromApi(dto: unknown): Match {
    if (!dto || typeof dto !== 'object') {
      console.error('Received undefined, null, or non-object dto in MatchAdapter.fromApi');
      return {
        id: '',
        title: '',
        competition: '',
        date: new Date(),
        status: MatchStatus.Upcoming,
        availability: MatchAvailability.Unavailable,
        streamURL: '',
        thumbnail: undefined,
        location: undefined
      };
    }
    const d = dto as Record<string, unknown>;
    function getStr(key: string): string {
      const val = d[key];
      return typeof val === 'string' ? val : '';
    }
    return {
      id: getStr('id') || getStr('Id'),
      title: getStr('title') || getStr('Title'),
      competition: getStr('competition') || getStr('Competition'),
      date: getStr('date') ? new Date(getStr('date')) : (getStr('Date') ? new Date(getStr('Date')) : new Date()),
      status: mapMatchStatus(getStr('status') || getStr('Status')),
      availability: mapMatchAvailability(getStr('availability') || getStr('Availability')),
      streamURL: getStr('streamURL') || getStr('StreamURL'),
      thumbnail: getStr('thumbnail') || getStr('Thumbnail') || undefined,
      location: getStr('location') || getStr('Location') || undefined
    };
  }

  /**
   * Convert from frontend model to backend DTO
   * @param model - The frontend Match model
   * @returns - A DTO ready to be sent to the backend
   */
  static toApi(model: Match): MatchDto {
    return {
      id: model.id,
      title: model.title,
      competition: model.competition,
      date: model.date.toISOString(), // Convert Date to ISO string
      status: model.status, // Enum values match backend strings
      availability: model.availability,
      streamURL: model.streamURL || null,
      thumbnail: model.thumbnail || undefined, // Map thumbnail back to DTO
      location: model.location || undefined // Map location back to DTO
    };
  }

  /**
   * Map a collection of DTOs to frontend models
   * @param dtos - Array of DTOs from the backend or potentially a single DTO
   * @returns - Array of frontend models
   */
  static fromApiList(dtos: MatchDto[] | MatchDto | unknown): Match[] {
    // Handle non-array inputs
    if (!dtos) {
      console.error('Received undefined or null dtos in MatchAdapter.fromApiList');
      return [];
    }

    // If dtos is not an array, wrap it in an array if it's an object, or return empty array
    if (!Array.isArray(dtos)) {
      console.error('Received non-array in MatchAdapter.fromApiList:', typeof dtos);
      // If it's an object, it might be a single DTO
      if (typeof dtos === 'object') {
        return [this.fromApi(dtos as MatchDto)];
      }
      return [];
    }

    // Map each DTO to a Match model, with safe handling of each item
    return dtos.map(dto => this.fromApi(dto));
  }

  /**
   * Map status string from backend to frontend enum
   * @param status - Status string from backend
   * @returns - Corresponding enum value
   */
  private static mapStatus(status: string): MatchStatus {
    return mapMatchStatus(status);
  }

  /**
   * Map availability string from backend to frontend enum
   * @param availability - Availability string from backend
   * @returns - Corresponding enum value
   */
  private static mapAvailability(availability: string): MatchAvailability {
    return mapMatchAvailability(availability);
  }
}
