using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add before app.Build()
builder.Services.AddCors();

var app = builder.Build();

// Add after app = builder.Build();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

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
        correctNumberToReturn = secretNumber; // Show the correct number on game over
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

app.Run();

record GuessRequest(int Guess);