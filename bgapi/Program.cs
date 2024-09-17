using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using bapi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Prevent circular references in JSON serialization
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
});

// Configure MySQL database context
builder.Services.AddDbContext<BugTrackingContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 0))
    )
);

// Add CORS policy for your React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policyBuilder =>
        {
            policyBuilder.WithOrigins(
                "https://onebug.netlify.app", 
                "http://localhost:5174",    
                "http://localhost:5180"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); 
        });
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "BugAPI",
        Description = "An API to manage bugs and issues",
        Contact = new OpenApiContact
        {
            Name = "Your Name",
            Email = "your.email@example.com",
            Url = new Uri("https://yourwebsite.com"),
        }
    });

    // Optional: Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Optionally configure Kestrel if you have specific port requirements
// Commented out as per our previous suggestion
/*
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5180); // HTTP
    options.ListenAnyIP(7167, listenOptions =>
    {
        listenOptions.UseHttps(); // HTTPS
    });
});
*/

var app = builder.Build();

app.UseHttpsRedirection();

// Apply CORS policy before authorization
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BugAPI v1");
        c.RoutePrefix = "swagger"; 
    });
}



app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
