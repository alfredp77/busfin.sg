using System;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Busfin.Server
{
    class Program
    {
        static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appconfig.json")
                .Build();

            var webHost = new WebHostBuilder()
                .UseKestrel()
                .UseWebRoot("dist")
                .UseUrls($"http://localhost:{config["Port"]}")
                .UseStartup<Program>()
                .Build();
            webHost.Run();

        }
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseStaticFiles();
        }

    }
}
