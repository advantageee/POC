using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using InvestorCodex.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add configuration settings
builder.Services.Configure<AdvantageAISettings>(
    builder.Configuration.GetSection(AdvantageAISettings.SectionName));
builder.Services.Configure<ApolloSettings>(
    builder.Configuration.GetSection(ApolloSettings.SectionName));
builder.Services.Configure<TwitterAPISettings>(
    builder.Configuration.GetSection(TwitterAPISettings.SectionName));

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();

