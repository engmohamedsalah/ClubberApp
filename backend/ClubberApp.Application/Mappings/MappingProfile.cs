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
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        // No reverse map needed for MatchDto -> Match in this scope

        // Playlist Mappings (No direct mapping needed for Playlist join entity to PlaylistDto)
        // The PlaylistService now constructs PlaylistDto from a list of MatchDto.
    }
}

