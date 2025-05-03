using System;

namespace ClubberApp.Application.DTOs;

public class MatchUpdateDto
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty; // Use string for API flexibility
    public string Availability { get; set; } = string.Empty; // Use string for API flexibility
    public string StreamURL { get; set; } = string.Empty;
} 