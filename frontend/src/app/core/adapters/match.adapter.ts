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
    return {
      id: dto.id,
      title: dto.title,
      competition: dto.competition,
      date: new Date(dto.date), // Convert ISO string to Date object
      status: this.mapStatus(dto.status),
      availability: this.mapAvailability(dto.availability),
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
   * @param dtos - Array of DTOs from the backend
   * @returns - Array of frontend models
   */
  static fromApiList(dtos: MatchDto[]): Match[] {
    return dtos.map(dto => this.fromApi(dto));
  }

  /**
   * Map status string from backend to frontend enum
   * @param status - Status string from backend
   * @returns - Corresponding enum value
   */
  private static mapStatus(status: string): MatchStatus {
    switch (status) {
      case 'NotStarted': return MatchStatus.NotStarted;
      case 'InProgress': return MatchStatus.InProgress;
      case 'Completed': return MatchStatus.Completed;
      case 'Cancelled': return MatchStatus.Cancelled;
      default: return MatchStatus.NotStarted; // Default value as fallback
    }
  }

  /**
   * Map availability string from backend to frontend enum
   * @param availability - Availability string from backend
   * @returns - Corresponding enum value
   */
  private static mapAvailability(availability: string): MatchAvailability {
    switch (availability) {
      case 'Available': return MatchAvailability.Available;
      case 'Unavailable': return MatchAvailability.Unavailable;
      default: return MatchAvailability.Unavailable; // Default value as fallback
    }
  }
}
