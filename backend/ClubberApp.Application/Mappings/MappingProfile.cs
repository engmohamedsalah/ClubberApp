using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User Mappings
        CreateMap<User, UserDto>();
        CreateMap<RegisterDto, User>(); // Note: Password hashing handled separately

        // Match Mappings
        CreateMap<Match, MatchDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Availability, opt => opt.MapFrom(src => src.Availability.ToString()));
        
        CreateMap<MatchCreateDto, Match>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Competition, opt => opt.MapFrom(src => src.Sport));
            
        CreateMap<MatchUpdateDto, Match>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Competition, opt => opt.MapFrom(src => src.Sport));

        // Playlist Mappings (No direct mapping needed for Playlist join entity to PlaylistDto)
        // The PlaylistService now constructs PlaylistDto from a list of MatchDto.
    }
}

