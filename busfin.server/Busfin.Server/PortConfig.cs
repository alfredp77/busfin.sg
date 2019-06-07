using Microsoft.Extensions.Configuration;

namespace Busfin.Server
{
    public static class PortConfig
    {
        public static int GetPort(this IConfiguration config, PortTypes portType)
        {
            var key = $"ports:{portType.ToString().ToLower()}";
            return config.GetValue<int>(key);
        }
    }
}