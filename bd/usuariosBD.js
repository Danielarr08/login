var { conexionUs, conexionProd } = require("./conexion");
var Usuario = require("../modelos/Usuario");
const { generarPassword, validarPassword } = require("../middlewares/password");

async function mostrarUsuarios() {
    var users = [];
    try {
        var usuarios = await conexionUs.get(); 
        usuarios.forEach((usuario) => {
            var usuario1 = new Usuario(usuario.id, usuario.data());
            if (usuario1.bandera == 0) {
                users.push(usuario1.obtenerUsuario);
            }
        });
    } catch (err) {
        console.log("Error al obtener los usuarios de firebase" + err);
        users.push(null);
    }
    return users;
}

async function buscarporID(id) {
    var user;
    try {
        var usuariobd = await conexionUs.doc(id).get();
        var usuarioObjeto = new Usuario(usuariobd.id, usuariobd.data());
        if (usuarioObjeto.bandera == 0) {
            user = usuarioObjeto;
        }
    } catch (err) {
        console.log("Error al buscar al usuario" + err);
        user = null;
    }
    return user;
}

async function nuevoUsuario(datos) {
    var {salt, hash }=generarPassword(datos.password)
    datos.password=hash;
    datos.salt=salt;
    var usuario = new Usuario(null, datos);
    var error = 1;
    //console.log(usuario.obtenerUsuario);
    if (usuario.bandera == 0) {
        try {
            await conexionUs.doc().set(usuario.obtenerUsuario); 
            console.log("Usuario Registrado correctamente");
            error = 0;
        } catch (err) {
            console.log("Error al registar usuario" + err);
        }
    }
    return error;
}

async function modificarUsuario(datos) {
    var user = await buscarporID(datos.id);
    var error = 1;
    if (user!=undefined){
            
        if(datos.password==""){
            datos.password=user.password;
            datos.salt=user.salt;
        }
        else{
            var {salt,hash}=generarPassword(datos.password);
            datos.password=hash;
            datos.salt=salt;
        }
        var usuario = new Usuario(datos.id, datos); 
        if (usuario.bandera == 0) {
            
            try {
                await conexionUs.doc(usuario.id).set(usuario.obtenerUsuario); 
                console.log("Usuario actualizado");
                error = 0;
            } catch (err) {
                console.log("Error al modificar el usuario" + err);
            }
        } else {
            console.log("Los datos no son correctos");
        }
    }   
    return error;
}

async function borrarUsuario(id) {
    var error = 1;
    var user=await buscarporID(id);
    if(user!=undefined){
        try {
            await conexionUs.doc(id).delete(); 
            console.log("Usuario borrado");
            error = 0;
        } catch (err) {
            console.log("Error al borrar el usuario" + err);
        }
    }
    return error;
}

async function login(formData) {
    try {
        console.log("Datos del formulario:", formData);

        const usuario = await conexionUs.where("usuario", "==", formData.usuario).get().then(querySnapshot => {
            return querySnapshot.empty ? null : querySnapshot.docs[0].data();
        });

        console.log("Usuario encontrado:", usuario);

        if (usuario) {
            if (validarPassword(formData.password, usuario.password, usuario.salt)) {
                console.log("Inicio de sesión exitoso");
                return { exitoso: true, usuario, mensaje: "Inicio de sesión exitoso" };
            } else {
                console.log("Contraseña incorrecta");
                return { exitoso: false, mensaje: "Contraseña incorrecta" };
            }
        } else {
            console.log("Usuario no encontrado");
            return { exitoso: false, mensaje: "Usuario no encontrado" };
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return { exitoso: false, mensaje: "Error al iniciar sesión" };
    }
}





module.exports = {
    mostrarUsuarios,
    buscarporID,
    nuevoUsuario,
    modificarUsuario,
    borrarUsuario,
    login
};
