using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace Busfin.Server
{
    [Route("runtime")]
    public class RuntimeController : Controller
    {
        private readonly IApplicationLifetime _appLifetime;

        public RuntimeController(IApplicationLifetime appLifetime)
        {
            _appLifetime = appLifetime;
        }

        [HttpPost]
        [Route("stop")]
        public void Stop()
        {
            _appLifetime.StopApplication();
        }
    }
}