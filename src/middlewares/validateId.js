import mongoose from "mongoose";

function idMongoDBValidator(id) {
  //validacion basica que no este el id vacio y su longitud sea de 24 caracteres
    if (!id || id.trim().length !== 24) 
        return false;

  //validar en formato hexa
    const isValidHex = /^[0-9a-fA-F]{24}$/.test(id.trim());
    if (!isValidHex) 
        return false;

    return true;
} //fin de idMongoDBValidator

export const validateId = (req, res, next) => {
    try {
    const { id } = req.params;

    //validaciones basicas de vacio, longitud y hexadecimal
    const validateId = idMongoDBValidator(id);

    if (!validateId)
        return res
            .status(400)
                .json({ message: ["ID inválido o longitud inválida"] });

    //limpiar de espacios en blanco
    const cleanId = id.trim();

    //validamos con moongose
    if (!mongoose.isValidObjectId(cleanId))
        return res
            .status(400)
                .json({ message: ["Formato de ID no válido para MongoDB"] });

    //validar si es posible crear un objectId con los datos del ID
    const objectId = mongoose.Types.ObjectId.createFromHexString(cleanId);

    //verificar si el objeto creado es válido
    if (objectId.toString() !== cleanId.toLowerCase())
        return res.status(400).json({ message: ["Error al procesar el ID"] });

    //validar los IDs especiales, reservados para mongoDB
    //o IDs sospechosos para testing de ataques
    //o secuencias que nunca generara mongo un ID
    const reservedOrSuspiciousIds = [
        "000000000000000000000000",
        "ffffffffffffffffffffffff",
      //patrones de testing comunes
        "aaaaaaaaaaaaaaaaaaaaaaaaaa",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "cccccccccccccccccccccccc",
      //secuencias obvias
        "0123456789abcdef01234567",
        "1234567890abcdef12345678",
      //palabras o conceptos en hex
      "deadbeefdeadbeefdeadbeef", //dead beef
      "cafebabecafebabecafebabe", //cafe babe
      "badc0ffeebadc0ffeebadc0", //bad coffee
    ];

    if (reservedOrSuspiciousIds.includes(cleanId.toLowerCase()))
        return res
        .status(400)
        .json({ message: ["Error, ID reservado o sospechoso"] });
    next();
    } catch (error) {
    return res
        .status(400)
            .json({ message: ["El ID no es un ObjectId válido"] });
    }
}; //fin de validateId