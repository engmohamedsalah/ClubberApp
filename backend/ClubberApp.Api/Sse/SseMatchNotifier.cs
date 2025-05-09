using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace ClubberApp.Api.Sse
{
    public class SseMatchNotifier
    {
        private static readonly Lazy<SseMatchNotifier> _instance = new(() => new SseMatchNotifier());
        public static SseMatchNotifier Instance => _instance.Value;

        private readonly ConcurrentDictionary<Guid, HttpResponse> _clients = new();

        private SseMatchNotifier() { }

        public async Task RegisterClientAsync(HttpResponse response, CancellationToken cancellationToken)
        {
            var clientId = Guid.NewGuid();
            _clients[clientId] = response;
            try
            {
                // Keep the connection open until cancelled
                var tcs = new TaskCompletionSource();
                using (cancellationToken.Register(() => tcs.TrySetResult()))
                {
                    await tcs.Task;
                }
            }
            finally
            {
                _clients.TryRemove(clientId, out _);
            }
        }

        public async Task BroadcastMatchEventAsync(object matchEvent)
        {
            var json = JsonSerializer.Serialize(matchEvent);
            var data = $"data: {json}\n\n";
            var toRemove = new List<Guid>();
            foreach (var kvp in _clients)
            {
                try
                {
                    await kvp.Value.WriteAsync(data);
                    await kvp.Value.Body.FlushAsync();
                }
                catch
                {
                    toRemove.Add(kvp.Key);
                }
            }
            // Remove disconnected clients
            foreach (var id in toRemove)
            {
                _clients.TryRemove(id, out _);
            }
        }
    }
} 