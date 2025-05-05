using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Application.Enums;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User Mappings
        CreateMap<User, UserDto>();
        CreateMap<RegisterDto, User>(); // Note: Password hashing handled separately

        // Match Mappings - Updated for unified DTO with enum support
        CreateMap<Match, MatchDto>();
        
        // Domain to DTO mapping (with status mapping)
        CreateMap<Domain.Entities.MatchStatus, Enums.MatchStatus>()
            .ConvertUsing(src => MapDomainStatusToDto(src));
            
        CreateMap<Domain.Entities.MatchAvailability, Enums.MatchAvailability>()
            .ConvertUsing(src => MapDomainAvailabilityToDto(src));
            
        // DTO to Domain mapping (with status mapping)
        CreateMap<Enums.MatchStatus, Domain.Entities.MatchStatus>()
            .ConvertUsing(src => MapDtoStatusToDomain(src));
            
        CreateMap<Enums.MatchAvailability, Domain.Entities.MatchAvailability>()
            .ConvertUsing(src => MapDtoAvailabilityToDomain(src));
        
        // DTO to entity mapping
        CreateMap<MatchDto, Match>();

        // Playlist Mappings (No direct mapping needed for Playlist join entity to PlaylistDto)
        // The PlaylistService now constructs PlaylistDto from a list of MatchDto.
    }
    
    // Status mapping methods
    private Enums.MatchStatus MapDomainStatusToDto(Domain.Entities.MatchStatus status)
    {
        return status switch
        {
            Domain.Entities.MatchStatus.Live => Enums.MatchStatus.Live,
            Domain.Entities.MatchStatus.OnDemand => Enums.MatchStatus.OnDemand,
            Domain.Entities.MatchStatus.Canceled => Enums.MatchStatus.Canceled,
            Domain.Entities.MatchStatus.Upcoming => Enums.MatchStatus.Upcoming,
            _ => Enums.MatchStatus.Upcoming
        };
    }
    
    private Domain.Entities.MatchStatus MapDtoStatusToDomain(Enums.MatchStatus status)
    {
        return status switch
        {
            Enums.MatchStatus.Live => Domain.Entities.MatchStatus.Live,
            Enums.MatchStatus.OnDemand => Domain.Entities.MatchStatus.OnDemand,
            Enums.MatchStatus.Canceled => Domain.Entities.MatchStatus.Canceled,
            Enums.MatchStatus.Upcoming => Domain.Entities.MatchStatus.Upcoming,
            _ => Domain.Entities.MatchStatus.Upcoming // Default case
        };
    }
    
    // Availability mapping methods
    private Enums.MatchAvailability MapDomainAvailabilityToDto(Domain.Entities.MatchAvailability availability)
    {
        return availability switch
        {
            Domain.Entities.MatchAvailability.Unavailable => Enums.MatchAvailability.Unavailable,
            Domain.Entities.MatchAvailability.Restricted => Enums.MatchAvailability.Unavailable,
            Domain.Entities.MatchAvailability.Scheduled => Enums.MatchAvailability.Available, // Scheduled matches should be available
            _ => Enums.MatchAvailability.Available
        };
    }
    
    private Domain.Entities.MatchAvailability MapDtoAvailabilityToDomain(Enums.MatchAvailability availability)
    {
        return availability switch
        {
            Enums.MatchAvailability.Unavailable => Domain.Entities.MatchAvailability.Unavailable,
            Enums.MatchAvailability.Available => Domain.Entities.MatchAvailability.Available,
            _ => Domain.Entities.MatchAvailability.Available
        };
    }
}

