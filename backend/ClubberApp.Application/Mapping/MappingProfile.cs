using AutoMapper;
using ClubberApp.Application.DTOs;
using ClubberApp.Domain.Entities;

namespace ClubberApp.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));
            CreateMap<UserProfileUpdateDto, User>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username));
        }
    }
} 