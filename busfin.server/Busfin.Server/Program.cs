using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Busfin.Server
{
    class Program
    {
        static void Main(string[] args)
        {
            var assemblyPath = new Uri(Assembly.GetExecutingAssembly().CodeBase).LocalPath;
            var basePath = Path.GetDirectoryName(assemblyPath);
            var config = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appconfig.json")
                .Build();

            var runtimePort = config.GetPort(PortTypes.Runtime);
            PortActionConstraint.AddPort(PortTypes.Runtime, runtimePort);

            var openfinPort = config.GetPort(PortTypes.Openfin);
            var webHost = new WebHostBuilder()
                .UseKestrel()
                .UseWebRoot("dist")
                .UseUrls($"http://localhost:{openfinPort}", $"http://localhost:{runtimePort}")
                .UseStartup<Program>()
                .Build();
            webHost.Run();

        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();            
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseStaticFiles()
               .UseMvc();
        }
    }
}
