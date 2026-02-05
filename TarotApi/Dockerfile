# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TarotApi.csproj", "./"]
RUN dotnet restore "TarotApi.csproj"
COPY . .
# Ensure we don't carry over any windows artifacts if .dockerignore failed (safety net)
RUN rm -rf bin obj
RUN dotnet publish "TarotApi.csproj" -c Release -o /app/publish

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_EnableDiagnostics=0
EXPOSE 8080
ENTRYPOINT ["dotnet", "TarotApi.dll"]
