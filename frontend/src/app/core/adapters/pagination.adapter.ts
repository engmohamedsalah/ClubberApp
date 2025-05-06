import { PaginatedResult } from '../../models/pagination.model';
import { LoggingService } from '../services/logging.service';

/**
 * Backend DTO for paginated results
 * This should match the exact structure returned by the backend
 */
export interface PaginatedResultDto<T> {
  data?: T[]; // Some APIs use 'data', 'items', or 'results'
  items?: T[]; // Allow for different property names from the backend
  results?: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number; // Some APIs include this, some don't
}

/**
 * Adapter to convert between backend PaginatedResultDto and frontend PaginatedResult
 */
export class PaginationAdapter {
  private static loggingService: LoggingService;

  /**
   * Initialize the adapter with dependencies
   */
  static initialize(loggingService: LoggingService): void {
    this.loggingService = loggingService;
  }

  /**
   * Convert a backend paginated result DTO to a frontend model
   * Handles various response formats:
   * - Standard PaginatedResultDto object
   * - Array of items (will create a default pagination wrapper)
   * - Alternative property names
   * - Case insensitive property matching
   *
   * @param dto - Backend PaginatedResultDto or array of items
   * @returns - Frontend PaginatedResult model
   */
  static fromApi<T, R>(dto: PaginatedResultDto<T> | T[], itemAdapter?: (item: T) => R): PaginatedResult<R> {
    try {
      // Add additional logging for debugging
      if (this.loggingService) {
        this.loggingService.logInfo('PaginationAdapter input', {
          isArray: Array.isArray(dto),
          dtoType: dto ? typeof dto : 'undefined/null',
          hasAdapter: !!itemAdapter
        });
      }

      // Handle case where API returns a direct array instead of a paginated object
      if (Array.isArray(dto)) {
        const items = dto as T[];
        const transformedItems = itemAdapter
          ? items.map(item => {
              try {
                return itemAdapter(item);
              } catch (error) {
                if (this.loggingService) {
                  this.loggingService.logError('Error in itemAdapter for array item', { error, item });
                }
                throw error; // Re-throw to be caught by the outer try/catch
              }
            })
          : items as unknown as R[];

        // Create a default pagination wrapper
        return {
          data: transformedItems,
          page: 1,
          pageSize: items.length,
          totalCount: items.length
        };
      }

      // Normalize the paginated object
      const paginatedDto = dto as PaginatedResultDto<T>;

      // Check for null/undefined dto
      if (!paginatedDto) {
        if (this.loggingService) {
          this.loggingService.logError('PaginationAdapter received null/undefined dto');
        }
        return {
          data: [],
          page: 1,
          pageSize: 10,
          totalCount: 0
        };
      }

      // Log the actual structure to help with debugging
      if (this.loggingService) {
        this.loggingService.logInfo('PaginationAdapter fromApi', {
          properties: Object.keys(paginatedDto),
          dto: JSON.stringify(paginatedDto).substring(0, 200) + '...' // Log first 200 chars of DTO for debugging
        });
      }

      // Try to find the items array using various property names (case insensitive)
      let items: T[] = [];
      const keys = Object.keys(paginatedDto);

      // First try the standard property names
      if (paginatedDto.data) items = paginatedDto.data;
      else if (paginatedDto.items) items = paginatedDto.items;
      else if (paginatedDto.results) items = paginatedDto.results;
      else {
        // Then try to find any array property with case-insensitive matching
        const dataKey = keys.find(k =>
          k.toLowerCase() === 'data' ||
          k.toLowerCase() === 'items' ||
          k.toLowerCase() === 'results'
        );

        if (dataKey && Array.isArray(paginatedDto[dataKey as keyof PaginatedResultDto<T>])) {
          items = paginatedDto[dataKey as keyof PaginatedResultDto<T>] as T[];
        }
      }

      // Apply item adapter if provided
      const transformedItems = itemAdapter
        ? items.map((item, index) => {
            try {
              if (!item) {
                if (this.loggingService) {
                  this.loggingService.logError('Null/undefined item in collection', {
                    index,
                    itemsLength: items.length
                  });
                }
                // Create a default item based on empty values
                // This is more robust than throwing an error
                return {} as R;
              }

              // Call the adapter with proper error handling
              try {
                return itemAdapter(item);
              } catch (adapterError) {
                if (this.loggingService) {
                  this.loggingService.logError('Error in itemAdapter for item', {
                    error: adapterError,
                    index,
                    item: JSON.stringify(item).substring(0, 100)
                  });
                }

                // Instead of re-throwing, return a default empty object
                // This allows the rest of the items to process
                return {} as R;
              }
            } catch (error) {
              if (this.loggingService) {
                this.loggingService.logError('General error processing collection item', {
                  error,
                  index,
                  items: JSON.stringify(items.slice(Math.max(0, index-2), Math.min(items.length, index+3))).substring(0, 200)
                });
              }
              // Return default object instead of throwing
              return {} as R;
            }
          })
        : items as unknown as R[];

      // Get pagination properties with fallbacks
      // Using case-insensitive property matching
      const getProperty = <V>(names: string[], defaultValue: V): V => {
        for (const name of names) {
          // Try exact match
          if (paginatedDto[name as keyof PaginatedResultDto<T>] !== undefined) {
            return paginatedDto[name as keyof PaginatedResultDto<T>] as unknown as V;
          }

          // Try case-insensitive match
          const key = keys.find(k => k.toLowerCase() === name.toLowerCase());
          if (key && paginatedDto[key as keyof PaginatedResultDto<T>] !== undefined) {
            return paginatedDto[key as keyof PaginatedResultDto<T>] as unknown as V;
          }
        }
        return defaultValue;
      };

      // Extract pagination properties with fallbacks
      const page = getProperty<number>(['page', 'pageNumber', 'pageNum'], 1);
      const pageSize = getProperty<number>(['pageSize', 'size', 'limit'], items.length);
      const totalCount = getProperty<number>(['totalCount', 'total', 'count'], items.length);

      return {
        data: transformedItems,
        page,
        pageSize,
        totalCount
      };
    } catch (error) {
      // Log error and return a safe default
      if (this.loggingService) {
        this.loggingService.logError('Error in PaginationAdapter.fromApi', { error, dto });
      }

      // Return empty result as fallback
      return {
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0
      };
    }
  }

  /**
   * Convert a frontend PaginatedResult to a backend DTO
   * @param model - Frontend PaginatedResult
   * @param dataPropertyName - The property name to use for the data array
   * @param itemAdapter - Optional adapter to convert each item
   * @returns - Backend PaginatedResultDto
   */
  static toApi<T, R>(
    model: PaginatedResult<T>,
    dataPropertyName: 'data' | 'items' | 'results' = 'data',
    itemAdapter?: (item: T) => R
  ): PaginatedResultDto<R> {
    // Apply item adapter if provided
    const transformedItems = itemAdapter
      ? model.data.map(item => itemAdapter(item))
      : model.data as unknown as R[];

    // Create the DTO with the specified property name for the data
    const dto: Partial<PaginatedResultDto<R>> = {
      page: model.page,
      pageSize: model.pageSize,
      totalCount: model.totalCount
    };

    // Set the data property using the specified name
    dto[dataPropertyName] = transformedItems;

    return dto as PaginatedResultDto<R>;
  }
}
