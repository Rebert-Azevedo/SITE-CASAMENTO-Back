exports.validateSecretKey = (req, res) => {
    res.status(200).json({ message: 'Chave secreta validada com sucesso.' });
};