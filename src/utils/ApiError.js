class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        stack = "",
        errors = [],
        data
    ){
        super(message)
        this.statusCode = statusCode,
        this.errors = errors,
        this.stack = stack,
        this.data = data,
        this.message = message,
        this.success = false
    }
}


export { ApiError }
