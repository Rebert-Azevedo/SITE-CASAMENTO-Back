const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Loga o stack trace do erro para depuração
    res.status(err.statusCode || 500).json({
        message: err.message || 'Erro interno do servidor.',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack // Não expõe stack trace em produção
    });
};

module.exports = errorHandler;