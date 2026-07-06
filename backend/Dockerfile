FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY AppEmit.API/AppEmit.API.csproj AppEmit.API/
RUN dotnet restore AppEmit.API/AppEmit.API.csproj
COPY . .
RUN dotnet publish AppEmit.API/AppEmit.API.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 5011
ENV ASPNETCORE_URLS=http://+:5011
ENV ASPNETCORE_ENVIRONMENT=Development
COPY --from=build /app .
ENTRYPOINT ["dotnet", "AppEmit.API.dll"]