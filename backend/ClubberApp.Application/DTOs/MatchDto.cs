using System;
using System.Text.Json.Serialization;
using ClubberApp.Application.Enums;

namespace ClubberApp.Application.DTOs;

public class MatchDto
{
    public Guid? Id { get; set; } // Nullable for creation scenarios
    public string Title { get; set; } = string.Empty;
    public string Competition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    
    // Using enums from the Enums folder
    public MatchStatus Status { get; set; } = MatchStatus.NotStarted;
    public MatchAvailability Availability { get; set; } = MatchAvailability.Available;
    
    public string StreamURL { get; set; } = string.Empty;
    
    // Added fields to align with frontend
    public string[] Teams { get; set; } = Array.Empty<string>();
    public string Location { get; set; } = string.Empty;
    public string Thumbnail { get; set; } = string.Empty;
    
    // Computed properties for the frontend
    [JsonIgnore]
    public bool IsLive => Status == MatchStatus.InProgress;
    
    [JsonIgnore]
    public bool IsReplay => Status == MatchStatus.Completed;
} 