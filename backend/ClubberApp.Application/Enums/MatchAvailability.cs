using System.Text.Json.Serialization;

namespace ClubberApp.Application.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MatchAvailability
{
    Available,
    Unavailable
} 