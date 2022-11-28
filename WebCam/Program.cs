using WebCam;

var builder = WebApplication.CreateBuilder(args);
var myAllowSpecificOrigins = "AllowOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(myAllowSpecificOrigins,
                      corsPolicyBuilder => corsPolicyBuilder.WithOrigins("http://127.0.0.1:4200")
                                                            .AllowAnyMethod()
                                                            .AllowAnyHeader()
                                                            .AllowCredentials());
});
builder.Services.AddSignalR();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseCors(myAllowSpecificOrigins);
app.UseEndpoints(endpoints => { endpoints.MapHub<SignalRtcHub>("/signalrtc"); });

app.Run();