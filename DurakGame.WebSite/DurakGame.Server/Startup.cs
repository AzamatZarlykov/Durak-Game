using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.WebSockets;
using System.Threading;
using DurakGame.Server.Middleware;

namespace DurakGame.Server
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddWebSocketManager(); 
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Using WebSockets 
            app.UseWebSockets();
            // Calling the middleware extensions to pass the requests to the middleware pipeline
            app.UseWebSocketServer();
            // Calling the default files i.e index.html
            app.UseDefaultFiles();
            // Allowing to use the static files locating in wwwroot folder (js, css, html, images)
            app.UseStaticFiles();
            
            app.Run(async context =>
            {
                Console.WriteLine("Hello From the last pipeline");
                await context.Response.WriteAsync("Hello From the last pipeline");
            });
        }
    }
}
