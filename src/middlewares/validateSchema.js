export const validateSchema = (schema) => (req,res,next)=>{
    try{
        //parse valida el objeto req.body contra el schema definido
        //si no hay error, se ejecuta next
        //console.log(req.body); //Que es lo que llega desde el front
        schema.parse(req.body);
        next();
    }catch(error){
        return res.status(400)
                    .json({
                        message: error.issues.map((error)=> error.message)
                    })
    }//Fin del try catch
}//Fin de validateSchema