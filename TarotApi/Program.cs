using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using TarotApi.Data;
using TarotApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configure EF Core with Npgsql
// Configure EF Core with Npgsql
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    
    // Fallback to DATABASE_URL if DefaultConnection is missing (common in cloud envs)
    if (string.IsNullOrEmpty(connectionString))
    {
        connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
    }

    if (!string.IsNullOrEmpty(connectionString))
    {
        // Check if it's a URI (postgres://) and convert to connection string
        try 
        {
            if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
            {
               // Custom parsing to handle passwords with special characters (like @) effectively
               // Format: scheme://user:password@host:port/database
               
               var cleanStr = connectionString.Replace("postgresql://", "").Replace("postgres://", "");
               
               // Find separation between credentials and host (last @) because password might contain @
               var lastAt = cleanStr.LastIndexOf('@');
               if (lastAt > 0)
               {
                   var credentials = cleanStr.Substring(0, lastAt);
                   var hostPart = cleanStr.Substring(lastAt + 1);
                   
                   // Host part: host:port/db
                   var slashIndex = hostPart.IndexOf('/');
                   var dbName = "postgres";
                   var hostPort = hostPart;

                   if (slashIndex > 0)
                   {
                       hostPort = hostPart.Substring(0, slashIndex);
                       // Handle potential query parameters like ?sslmode=...
                       var dbPart = hostPart.Substring(slashIndex + 1);
                       dbName = dbPart.Split('?')[0];
                   }
                   
                   var hostSplit = hostPort.Split(':');
                   var host = hostSplit[0];
                   var port = hostSplit.Length > 1 ? int.Parse(hostSplit[1]) : 5432;
                   
                   // Credentials part: user:pass
                   var firstColon = credentials.IndexOf(':');
                   if (firstColon > 0)
                   {
                       var username = credentials.Substring(0, firstColon);
                       var password = credentials.Substring(firstColon + 1);
                       
                       // Decode if it was URL encoded, but also handle raw
                       // Usually raw in env vars. Uri.UnescapeDataString could be used if we suspect encoding.
                       // For now, take as is.
                       
                       var npgsqlBuilder = new Npgsql.NpgsqlConnectionStringBuilder
                       {
                            Host = host,
                            Port = port,
                            Username = username,
                            Password = password,
                            Database = dbName,
                            SslMode = Npgsql.SslMode.Require,
                            TrustServerCertificate = true // Often required for cloud hosted DBs like Supabase/Render
                       };
                       connectionString = npgsqlBuilder.ToString();
                   }
               }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing connection string URI: {ex.Message}. Falling back to original string.");
        }
    }
    
    // Log the start of the connection string for debugging (don't log the password!)
    if (!string.IsNullOrEmpty(connectionString))
    {
        var safeLog = connectionString.Length > 15 ? connectionString.Substring(0, 15) + "..." : "ShortString";
        Console.WriteLine($"Using Connection String starting with: {safeLog}");
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddHttpClient<IGeminiService, GeminiService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin() // Allow specific Vercel URL in production ideally, but allowing all for now to ensure connection works
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Seed Data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Apply migrations automatically
        context.Database.Migrate(); 
        DbSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();
