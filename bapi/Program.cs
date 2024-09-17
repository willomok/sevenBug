using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using bapi.Models; 
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Prevent circular references in JSON serialization
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    // Optional: Pretty-print the JSON output
    options.JsonSerializerOptions.WriteIndented = true;
});

// Configure MySQL database context
builder.Services.AddDbContext<BugTrackingContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 0)) 
    )
);

// session support
builder.Services.AddDistributedMemoryCache(); // Required for session storage
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);  // Session timeout after 30 minutes
    options.Cookie.HttpOnly = true;  // Prevent JavaScript from accessing the session cookie
    options.Cookie.IsEssential = true;  // Ensure the session cookie is essential (GDPR compliant)
});

// CORS policy for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", 
        policyBuilder =>
        {
            policyBuilder.WithOrigins("http://localhost:5174", "http://localhost:5180") // Your React app URL
                         .AllowAnyHeader()
                         .AllowAnyMethod()
                         .AllowCredentials(); // Allow cookies or credentials
        });
});

// Swagger services for API documentation
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

// Configure Kestrel to listen on both HTTP and HTTPS
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5180); // HTTP
    options.ListenAnyIP(7167, listenOptions =>
    {
        listenOptions.UseHttps(); // HTTPS
    });
});

var app = builder.Build();

// Apply CORS policy before any other middleware
app.UseCors("AllowReactApp");
app.UseCors("AllowAll");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BugAPI v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the root
    });
}

app.UseHttpsRedirection();  // Redirect HTTP to HTTPS

app.UseSession();  // Enable session middleware

app.UseAuthorization();

app.MapControllers();

app.Run();
