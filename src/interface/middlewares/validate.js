
const validate = (schema) => {
    return (req, res, next) => {
        try{
            // Checando os dados no corpo da requisição 
            schema.parse(req.body);
            
            next();

        }catch(error){
            const errorMessages = error.errors.map(err => {
                field: err.path.join('.');
                message: err.message
            });
            return res.status(400).json({ errors: errorMessages, error });
        }
    }
}

module.exports = validate;