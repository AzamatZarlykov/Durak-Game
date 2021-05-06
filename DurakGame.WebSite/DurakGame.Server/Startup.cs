using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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

            // Allowing to use the static files locating in wwwroot folder (js, css, html, images)
            // and using the default files in the wwwroot folder.
            // Below default name changes allow the home.html to be default file 
            FileServerOptions fileServerOptions = new FileServerOptions();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Clear();
            fileServerOptions.DefaultFilesOptions.DefaultFileNames.Add("home.html");

            app.UseFileServer(fileServerOptions);

            app.Run(async context =>
            {
                await context.Response.WriteAsync("Hello From the last pipeline");
            });
        }
    }
}
