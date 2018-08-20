'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');


function home(req, res) {
    res.status(200).send(
        { message: 'Hola mundo' }
    );
}


function pruebas(req, res) {
    res.status(200).send(
        { message: 'Pruebas de controlador' }
    );
}

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //Controlar usuarios duplicados.
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) {
                return res.status(500).send({ message: 'error al guardar al usuario' });
            }
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario ya existe.' });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'error al guardar al usuario' });

                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        }
                        else {
                            res.status(400).send({ message: 'No se ha registrado al usuario.' });
                        }
                    });
                });
            }
        });

    }
    else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }

}


function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        //generar y devoler token
                        return res.status(200).send({ token: jwt.createToken(user) });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar.' });
                }
            });
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar.' });
        }
    });
}

//Conseguir datos de un usuario.
function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (!user) return res.status(404).send({ message: 'El usuario no existe' });

        // Follow.findOne({"user": req.user.sub, "followed": userId}).exec((err, follow)=>{
        //     if(err) return res.status(500).send({message:""});

        //     return res.status(200).send({user, follow});
        // });

        followThisUser(req.user.sub, userId).then((value) => {
            return res.status(200).send({ user, value });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id })
        .exec((err, follow) => {
            if (err) return handleError(err);

            return follow;
        });

    var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id })
        .exec((err, follow) => {
            if (err) return handleError(err);

            return follow;
        });

    return {
        following,
        followed
    };
}

//Devolver listado de usuarios
function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles.' });

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage),
            });
        });
    });
}

async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id })
        .select({ '_id': 0, '_v': 0, 'user': 0 })
        .exec((err, follows) => {

            return follows;
        });

    var followed = await Follow.find({ "followed": user_id })
        .select({ '_id': 0, '_v': 0, 'followed': 0 })
        .exec((err, follows) => {
            // console.log(follows);
            return follows;
        });

    var following_clean = [];
    if (following) {
        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });
    }

    var followed_clean = [];
    if (followed) {
        followed.forEach(follow => {
            followed_clean.push(follow.user);
        });
    }

    return {
        following: following_clean,
        followed: followed_clean
    }
}

function getCounters(req, res) {
    var user_id = req.user.sub;
    if (req.params.id) {
        user_id = req.params.id;
    }

    //Provisional mientras se ve porque no funciona async/await
    Follow.count({ "user": user_id }).exec((err, following) => {
        if (err) {
            console.log(err);
            return handleError(err);
        }

        Follow.count({ "followed": user_id }).exec((err, followed) => {
            if (err) {
                console.log(err);
                return handleError(err);
            }

            Publication.count({ "user": user_id }).exec((err, publications) => {
                if (err) return handleError(err);

                return res.status(200).send({ following, followed, publications });
            });
        });

    });

    // getCountFollow(user_id).then((value) => {
    //     return res.status(200).send({ value });
    // });

}

async function getCountFollow(user_id) {
    var following = await Follow.count({ "user": user_id }).exec((err, count) => {
        if (err) {
            console.log(err);
            return handleError(err);
        }

        return count;
    });

    var followed = await Follow.count({ "followed": user_id }).exec((err, count) => {
        if (err) return handleError(err);

        return count;
    });

    var publications = await Publication.count({ "user": user_id }).exec((err, count) => {
        if (err) return handleError(err);
        return count;

    });

    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

//Edicion de datos de usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar la propiedad pass.
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permisos' });
    }

    User.find({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, users) => {
        var user_isset = false;
        users.forEach((user) => {
            if (user._id != userId) {
                user_isset = true;
            }
        });
        if (user_isset) {
            res.status(404).send({ message: "los datos ya estan en uso." });
        } else {

            User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });

                return res.status(200).send({ user: userUpdated });

            });
        }
    })



}

//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    var userId = req.params.id;



    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext = file_name.split('\.');
        var file_ext = ext[1];

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No hay permisos');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' });

                if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });

                return res.status(200).send({ user: userUpdated });
            });
        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no valida.');
        }

    } else {
        return res.status(200).send({ message: 'No se subieron los archivos.' });
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        if (err)
            return res.status(200).send({ message: message });
    });
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;
    console.log(path_file);
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            return res.status(200).send({ message: 'No existe la imagen.' });
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
};