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
  static fromApi(dto: MatchDto): Match {
    if (!dto) {
      console.error('Received undefined or null dto in MatchAdapter.fromApi');
      // Return a default Match object with empty values
      return {
        id: '',
        title: '',
        competition: '',
        date: new Date(),
        status: MatchStatus.Upcoming,
        availability: MatchAvailability.Unavailable,
        streamURL: ''
      };
    }

    // Use standalone functions instead of class methods to avoid 'this' context issues
    return {
      id: dto.id || '',
      title: dto.title || '',
      competition: dto.competition || '',
      date: dto.date ? new Date(dto.date) : new Date(), // Convert ISO string to Date object
      status: mapMatchStatus(dto.status),
      availability: mapMatchAvailability(dto.availability),
      streamURL: dto.streamURL || ''
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
      streamURL: model.streamURL || null
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
