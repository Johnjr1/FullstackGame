using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services
builder.Services.AddCors();
builder.Services.AddControllers(); // Required for fallback routing
builder.Services.AddRouting();
builder.Services.AddSpaStaticFiles(config =>
{
    config.RootPath = "wwwroot"; // React build output path
});

var app = builder.Build();

// 2. Middleware
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

if (!app.Environment.IsDevelopment())
{
    app.UseSpaStaticFiles();
}

app.UseRouting();

// 3. API Endpoints
int secretNumber = Random.Shared.Next(1, 101);
int attemptCount = 0;

app.MapPost("/api/guess", async (HttpContext context) =>
{
    var form = await context.Request.ReadFromJsonAsync<GuessRequest>();
    if (form is null || form.Guess < 1 || form.Guess > 100)
        return Results.BadRequest("Guess must be between 1 and 100.");

    attemptCount++;

    string result;
    int? correctNumberToReturn = null;
    bool gameOver = false;

    if (form.Guess == secretNumber)
    {
        result = "correct";
        correctNumberToReturn = secretNumber;
        attemptCount = 0;
        secretNumber = Random.Shared.Next(1, 101);
    }
    else if (attemptCount >= 5)
    {
        result = "GAME OVER";
        correctNumberToReturn = secretNumber;
        gameOver = true;
        attemptCount = 0;
        secretNumber = Random.Shared.Next(1, 101);
    }
    else if (form.Guess < secretNumber)
    {
        result = "low";
    }
    else
    {
        result = "high";
    }

    return Results.Ok(new
    {
        result,
        attemptsLeft = gameOver ? 0 : 5 - attemptCount,
        correctNumber = correctNumberToReturn
    });
});

app.MapPost("/api/restart", () =>
{
    secretNumber = Random.Shared.Next(1, 101);
    attemptCount = 0;
    return Results.Ok(new { message = "Game restarted!", secretNumber });
});

// 4. Fallback to index.html for React routes
app.MapFallbackToFile("index.html");

app.Run();

// DTO
record GuessRequest(int Guess);
