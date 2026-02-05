FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /source
COPY TarotApi.csproj .
RUN dotnet restore
COPY . .
# UseSharedCompilation=false helps reduce memory usage during build
RUN dotnet publish -c Release -o /app/publish /p:UseSharedCompilation=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
# Install ICU libs for correct Vietnamese text handling on Alpine Linux
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TarotApi.dll"]
