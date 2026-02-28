const asyncHandler = (fnc) => async (req, res, next) => {
    try {
        return await fnc(req, res, next)
    } catch (error) {
        res.status(error.code || 400).json({
            sucess: false,
            message: error.message
        })
        
    }
}

export {asyncHandler}