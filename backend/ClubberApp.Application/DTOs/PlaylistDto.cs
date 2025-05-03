using System.Collections.Generic;

namespace ClubberApp.Application.DTOs;

public class PlaylistDto
{
    public List<MatchDto> Matches { get; set; } = new List<MatchDto>();
} 