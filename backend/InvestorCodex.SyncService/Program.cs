using InvestorCodex.SyncService;
using InvestorCodex.SyncService.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddHttpClient<ApolloClient>();
        services.AddSingleton<CompanyRepository>();
        services.AddSingleton<ContactRepository>();
        services.AddSingleton<SyncFailureLogger>();
        services.AddHostedService<ApolloSyncWorker>();
    })
    .Build();

await host.RunAsync();
