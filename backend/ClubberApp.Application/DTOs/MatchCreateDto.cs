using System;

namespace ClubberApp.Application.DTOs;

public class MatchCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = "NotStarted"; // Default to NotStarted, use string for API flexibility
    public string Availability { get; set; } = "Available"; // Default to Available
    public string StreamURL { get; set; } = string.Empty;
} 