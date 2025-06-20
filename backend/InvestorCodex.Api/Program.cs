using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using InvestorCodex.Api.Configuration;
using InvestorCodex.Api.Data;
using InvestorCodex.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Include environment variables so sensitive values can be supplied outside of
// source control.
builder.Configuration.AddEnvironmentVariables();

// Add in-memory caching
builder.Services.AddMemoryCache();

// Add configuration settings
builder.Services.Configure<AdvantageAISettings>(
    builder.Configuration.GetSection(AdvantageAISettings.SectionName));
builder.Services.Configure<ApolloSettings>(
    builder.Configuration.GetSection(ApolloSettings.SectionName));
builder.Services.Configure<TwitterAPISettings>(
    builder.Configuration.GetSection(TwitterAPISettings.SectionName));
builder.Services.Configure<ContextFeedSettings>(
    builder.Configuration.GetSection(ContextFeedSettings.SectionName));

builder.Services.Configure<VectorDbSettings>(
    builder.Configuration.GetSection(VectorDbSettings.SectionName));
builder.Services.Configure<BlobStorageSettings>(
    builder.Configuration.GetSection(BlobStorageSettings.SectionName));

builder.Services.Configure<ExportSettings>(
    builder.Configuration.GetSection(ExportSettings.SectionName));

// In-memory settings storage
builder.Services.AddSingleton<ISettingsService>(sp =>
    new InMemorySettingsService(sp.GetRequiredService<IConfiguration>()));


// Add HTTP clients for external services
builder.Services.AddHttpClient<IApolloService, ApolloService>();
builder.Services.AddHttpClient<ITwitterService, TwitterService>();
builder.Services.AddHttpClient<IContextFeedService, ContextFeedService>();
builder.Services.AddHttpClient(); // For EmbeddingController

// Add repository services
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<ISignalRepository, SignalRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add external API services
builder.Services.AddScoped<IApolloService, ApolloService>();
builder.Services.AddScoped<IContextFeedService, ContextFeedService>();
builder.Services.AddScoped<ISignalDetectionService, SignalDetectionService>();
builder.Services.AddSingleton<IExportJobService, ExportJobService>();

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
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3006", "http://localhost:3007")
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

