using System.Text.Json.Serialization;
using System.ComponentModel;
using System.Runtime.Serialization;

namespace ClubberApp.Application.Enums;

/// <summary>
/// Status of a match
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MatchStatus
{
    /// <summary>
    /// Match is scheduled but not started yet
    /// </summary>
    [EnumMember(Value = "Upcoming")]
    Upcoming,
    
    /// <summary>
    /// Match is currently in progress
    /// </summary>
    [EnumMember(Value = "Live")]
    Live,
    
    /// <summary>
    /// Match has completed and is available for replay
    /// </summary>
    [EnumMember(Value = "OnDemand")]
    OnDemand,
    
    /// <summary>
    /// Match has been canceled
    /// </summary>
    [EnumMember(Value = "Canceled")]
    Canceled
} 