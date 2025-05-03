using System;

namespace ClubberApp.Application.DTOs;

public class MatchDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Competition { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty; // String representation for API
    public string Availability { get; set; } = "Available"; // String representation for API
    public string StreamURL { get; set; } = string.Empty;
} 