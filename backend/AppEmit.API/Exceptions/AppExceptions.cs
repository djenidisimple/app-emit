namespace AppEmit.API.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404) { }
}

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message) : base(message, 401) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message, 409) { }
}

public class ValidationException : AppException
{
    public ValidationException(string message) : base(message, 422) { }
}
